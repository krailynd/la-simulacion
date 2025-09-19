"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { RotateCcw, Play, Pause, Calculator, Target, History, Trash2 } from "lucide-react"

interface CalculationResult {
  id: number
  depth: number
  fluidDensity: number
  pressure: number
  timestamp: Date
  formula: string
}

export function UnderPressureSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  const [depth, setDepth] = useState([5])
  const [fluidDensity, setFluidDensity] = useState([1000])
  const [isPlaying, setIsPlaying] = useState(false)
  const [pressure, setPressure] = useState(0)
  const [gravity] = useState(9.81)

  // Interactive input fields
  const [depthInput, setDepthInput] = useState("5")
  const [densityInput, setDensityInput] = useState("1000")
  const [targetPressure, setTargetPressure] = useState("")
  const [calculatedDepth, setCalculatedDepth] = useState(0)
  const [showCalculations, setShowCalculations] = useState(false)

  const [calculationHistory, setCalculationHistory] = useState<CalculationResult[]>([])
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<number | null>(null)

  // Animation state for 60fps
  const [bubbles, setBubbles] = useState<Array<{ x: number; y: number; radius: number; speed: number }>>([])

  useEffect(() => {
    const initialBubbles = Array.from({ length: 8 }, () => ({
      x: 100 + Math.random() * 200,
      y: 300 - (depth[0] / 10) * 200 + Math.random() * (depth[0] / 10) * 200,
      radius: 2 + Math.random() * 4,
      speed: 0.5 + Math.random() * 1.5,
    }))
    setBubbles(initialBubbles)
  }, [depth])

  // Calculate pressure with enhanced precision
  const calculatePressure = useCallback(
    (d: number, rho: number) => {
      const atmosphericPressure = 101325 // Pa
      return rho * gravity * d + atmosphericPressure
    },
    [gravity],
  )

  useEffect(() => {
    const calculatedPressure = calculatePressure(depth[0], fluidDensity[0])
    setPressure(calculatedPressure)

    // Auto-save to history when values change significantly
    const lastResult = calculationHistory[calculationHistory.length - 1]
    if (
      !lastResult ||
      Math.abs(lastResult.depth - depth[0]) > 0.1 ||
      Math.abs(lastResult.fluidDensity - fluidDensity[0]) > 50
    ) {
      const newResult: CalculationResult = {
        id: Date.now(),
        depth: depth[0],
        fluidDensity: fluidDensity[0],
        pressure: calculatedPressure,
        timestamp: new Date(),
        formula: `P = ${fluidDensity[0]} × ${gravity} × ${depth[0].toFixed(1)} + 101325 = ${calculatedPressure.toFixed(0)} Pa`,
      }

      setCalculationHistory((prev) => [...prev.slice(-19), newResult]) // Keep last 20
    }
  }, [depth, fluidDensity, calculatePressure, calculationHistory])

  const handleDepthInputChange = (value: string) => {
    setDepthInput(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 10) {
      setDepth([numValue])
    }
  }

  const handleDensityInputChange = (value: string) => {
    setDensityInput(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue >= 500 && numValue <= 2000) {
      setFluidDensity([numValue])
    }
  }

  const calculateDepthForPressure = () => {
    if (!targetPressure) return
    const targetP = Number.parseFloat(targetPressure) * 1000 // Convert kPa to Pa
    const atmosphericPressure = 101325
    const requiredDepth = (targetP - atmosphericPressure) / (fluidDensity[0] * gravity)
    const clampedDepth = Math.max(0.1, Math.min(10, requiredDepth))

    setCalculatedDepth(requiredDepth)
    setDepth([clampedDepth])
    setDepthInput(clampedDepth.toString())

    // Add to history
    const newResult: CalculationResult = {
      id: Date.now(),
      depth: clampedDepth,
      fluidDensity: fluidDensity[0],
      pressure: calculatePressure(clampedDepth, fluidDensity[0]),
      timestamp: new Date(),
      formula: `Objetivo: ${targetPressure} kPa → h = ${requiredDepth.toFixed(2)} m`,
    }
    setCalculationHistory((prev) => [...prev, newResult])
  }

  const loadFromHistory = (result: CalculationResult) => {
    setSelectedHistoryItem(result.id)

    // Animate to the historical values
    const startDepth = depth[0]
    const startDensity = fluidDensity[0]
    const targetDepth = result.depth
    const targetDensity = result.fluidDensity

    let progress = 0
    const animateToHistory = () => {
      progress += 0.05
      if (progress <= 1) {
        const currentDepth = startDepth + (targetDepth - startDepth) * progress
        const currentDensity = startDensity + (targetDensity - startDensity) * progress

        setDepth([currentDepth])
        setFluidDensity([currentDensity])
        setDepthInput(currentDepth.toFixed(1))
        setDensityInput(currentDensity.toString())

        requestAnimationFrame(animateToHistory)
      } else {
        setSelectedHistoryItem(null)
      }
    }
    animateToHistory()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    const animate = () => {
      // Clear canvas with better performance
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Enhanced container with realistic appearance
      ctx.strokeStyle = "#374151"
      ctx.lineWidth = 4
      ctx.strokeRect(50, 50, 300, 250)

      // Add container depth effect
      ctx.shadowColor = "rgba(0,0,0,0.15)"
      ctx.shadowBlur = 12
      ctx.shadowOffsetX = 3
      ctx.shadowOffsetY = 3
      ctx.strokeRect(50, 50, 300, 250)
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Enhanced fluid rendering with realistic depth
      const fluidHeight = (depth[0] / 10) * 200
      const fluidGradient = ctx.createLinearGradient(0, 300 - fluidHeight, 0, 300)

      // Improved fluid colors based on density
      if (fluidDensity[0] > 1500) {
        fluidGradient.addColorStop(0, "rgba(239, 68, 68, 0.7)")
        fluidGradient.addColorStop(0.5, "rgba(220, 38, 38, 0.8)")
        fluidGradient.addColorStop(1, "rgba(185, 28, 28, 0.9)")
      } else if (fluidDensity[0] > 1200) {
        fluidGradient.addColorStop(0, "rgba(59, 130, 246, 0.7)")
        fluidGradient.addColorStop(0.5, "rgba(37, 99, 235, 0.8)")
        fluidGradient.addColorStop(1, "rgba(29, 78, 216, 0.9)")
      } else {
        fluidGradient.addColorStop(0, "rgba(6, 182, 212, 0.7)")
        fluidGradient.addColorStop(0.5, "rgba(8, 145, 178, 0.8)")
        fluidGradient.addColorStop(1, "rgba(14, 116, 144, 0.9)")
      }

      ctx.fillStyle = fluidGradient
      ctx.fillRect(52, 300 - fluidHeight, 296, fluidHeight - 2)

      // Enhanced pressure visualization with better gradients
      const pressureIntensity = Math.min(pressure / 300000, 1)
      const pressureGradient = ctx.createRadialGradient(200, 300 - fluidHeight / 2, 0, 200, 300 - fluidHeight / 2, 150)
      pressureGradient.addColorStop(0, `rgba(245, 158, 11, ${0.3 * pressureIntensity})`)
      pressureGradient.addColorStop(0.7, `rgba(245, 158, 11, ${0.1 * pressureIntensity})`)
      pressureGradient.addColorStop(1, `rgba(245, 158, 11, 0)`)

      ctx.fillStyle = pressureGradient
      ctx.fillRect(52, 300 - fluidHeight, 296, fluidHeight - 2)

      if (isPlaying) {
        setBubbles((prevBubbles) => {
          const updatedBubbles = prevBubbles
            .map((bubble) => ({
              ...bubble,
              y: bubble.y - bubble.speed * (1 + pressureIntensity * 0.5), // Pressure affects bubble speed
              x: bubble.x + Math.sin(Date.now() * 0.002 + bubble.x * 0.01) * 0.8, // Realistic water movement
              radius: bubble.radius * (1 + pressureIntensity * 0.1), // Pressure affects bubble size
            }))
            .filter((bubble) => bubble.y > 300 - fluidHeight - 10)

          // Add new bubbles with better distribution
          if (Math.random() < 0.4 && updatedBubbles.length < 15) {
            updatedBubbles.push({
              x: 80 + Math.random() * 240,
              y: 295,
              radius: 1.5 + Math.random() * 3.5,
              speed: 0.8 + Math.random() * 2.2,
            })
          }

          return updatedBubbles
        })

        // Enhanced bubble rendering with realistic effects
        bubbles.forEach((bubble) => {
          // Bubble glow effect
          ctx.shadowColor = "rgba(255, 255, 255, 0.9)"
          ctx.shadowBlur = 8

          // Main bubble
          ctx.fillStyle = `rgba(255, 255, 255, ${0.8 - pressureIntensity * 0.2})`
          ctx.beginPath()
          ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2)
          ctx.fill()

          // Bubble highlight
          ctx.fillStyle = `rgba(255, 255, 255, ${0.9 - pressureIntensity * 0.1})`
          ctx.beginPath()
          ctx.arc(bubble.x - bubble.radius * 0.3, bubble.y - bubble.radius * 0.3, bubble.radius * 0.4, 0, Math.PI * 2)
          ctx.fill()

          ctx.shadowBlur = 0
        })
      }

      // Enhanced pressure indicator with better visualization
      const pressureIndicatorY = 300 - fluidHeight + (depth[0] / 10) * 100

      // Pressure indicator background
      ctx.fillStyle = "rgba(245, 158, 11, 0.3)"
      ctx.fillRect(30, pressureIndicatorY - 8, 35, 16)

      // Main pressure indicator
      ctx.fillStyle = "#f59e0b"
      ctx.fillRect(35, pressureIndicatorY - 4, 25, 8)

      // Pressure indicator border
      ctx.strokeStyle = "#d97706"
      ctx.lineWidth = 2
      ctx.strokeRect(35, pressureIndicatorY - 4, 25, 8)

      // Enhanced pressure line with animation
      ctx.strokeStyle = "#ef4444"
      ctx.lineWidth = 4
      ctx.lineCap = "round"
      ctx.setLineDash([10, 5])
      ctx.lineDashOffset = (Date.now() * 0.01) % 15 // Animated dashes
      ctx.beginPath()
      ctx.moveTo(370, 300 - fluidHeight)
      ctx.lineTo(370, pressureIndicatorY)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.lineDashOffset = 0

      // Enhanced scale with better formatting and visibility
      ctx.strokeStyle = "#64748b"
      ctx.lineWidth = 2
      ctx.font = "bold 12px monospace"
      ctx.fillStyle = "#374151"

      for (let i = 0; i <= 10; i++) {
        const y = 300 - (i / 10) * 200
        const pressureAtDepth = calculatePressure(i, fluidDensity[0])

        // Scale line
        ctx.beginPath()
        ctx.moveTo(375, y)
        ctx.lineTo(390, y)
        ctx.stroke()

        // Pressure value with better formatting
        const pressureKPa = pressureAtDepth / 1000
        ctx.fillText(`${pressureKPa.toFixed(0)}`, 395, y + 4)

        // Depth marker
        ctx.fillStyle = "#6b7280"
        ctx.font = "10px sans-serif"
        ctx.fillText(`${i}m`, 15, y + 3)
        ctx.font = "bold 12px monospace"
        ctx.fillStyle = "#374151"
      }

      // Enhanced information display with better layout
      ctx.fillStyle = "#374151"
      ctx.font = "bold 16px sans-serif"
      ctx.fillText(`Profundidad: ${depth[0].toFixed(2)} m`, 400, 80)
      ctx.fillText(`Densidad: ${fluidDensity[0]} kg/m³`, 400, 105)
      ctx.fillText(`Presión: ${(pressure / 1000).toFixed(2)} kPa`, 400, 130)

      // Enhanced formula display
      ctx.font = "14px monospace"
      ctx.fillStyle = "#6b7280"
      ctx.fillText(`P = ρgh + P₀`, 400, 155)
      ctx.fillText(`P = ${fluidDensity[0]} × ${gravity} × ${depth[0].toFixed(2)} + 101325`, 400, 175)

      ctx.font = "bold 14px monospace"
      ctx.fillStyle = "#374151"
      ctx.fillText(`P = ${pressure.toFixed(0)} Pa`, 400, 195)

      // Add pressure comparison
      ctx.font = "12px sans-serif"
      ctx.fillStyle = "#6b7280"
      const atmosphericRatio = ((pressure - 101325) / 101325).toFixed(1)
      ctx.fillText(`${atmosphericRatio}× presión atmosférica`, 400, 215)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [depth, fluidDensity, pressure, isPlaying, bubbles, calculatePressure, gravity])

  const reset = () => {
    setDepth([5])
    setFluidDensity([1000])
    setDepthInput("5")
    setDensityInput("1000")
    setIsPlaying(false)
    setTargetPressure("")
    setCalculatedDepth(0)
    setBubbles([])
  }

  const clearHistory = () => {
    setCalculationHistory([])
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Canvas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Simulación de Presión Hidrostática
              <div className="flex gap-2">
                <Button variant={isPlaying ? "default" : "outline"} size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowCalculations(!showCalculations)}>
                  <Calculator className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={reset}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <canvas ref={canvasRef} width={600} height={350} className="border border-border rounded-lg w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Controles Interactivos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Profundidad (m)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={depthInput}
                  onChange={(e) => handleDepthInputChange(e.target.value)}
                  min="0.1"
                  max="10"
                  step="0.1"
                  className="w-20"
                />
                <div className="flex-1">
                  <Slider
                    value={depth}
                    onValueChange={(value) => {
                      setDepth(value)
                      setDepthInput(value[0].toString())
                    }}
                    max={10}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Densidad del Fluido (kg/m³)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={densityInput}
                  onChange={(e) => handleDensityInputChange(e.target.value)}
                  min="500"
                  max="2000"
                  step="50"
                  className="w-24"
                />
                <div className="flex-1">
                  <Slider
                    value={fluidDensity}
                    onValueChange={(value) => {
                      setFluidDensity(value)
                      setDensityInput(value[0].toString())
                    }}
                    max={2000}
                    min={500}
                    step={50}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Calculadora de Profundidad
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Presión objetivo (kPa)"
                  value={targetPressure}
                  onChange={(e) => setTargetPressure(e.target.value)}
                  className="text-sm"
                />
                <Button size="sm" onClick={calculateDepthForPressure}>
                  Calcular
                </Button>
              </div>
              {calculatedDepth > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Profundidad requerida: {calculatedDepth.toFixed(3)} m
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Mediciones en Tiempo Real</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Presión Total:</span>
                  <Badge variant="secondary">{(pressure / 1000).toFixed(2)} kPa</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Presión Hidrostática:</span>
                  <Badge variant="outline">{((pressure - 101325) / 1000).toFixed(2)} kPa</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Presión Atmosférica:</span>
                  <Badge variant="outline">101.325 kPa</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Fuerza por m²:</span>
                  <Badge variant="outline">{pressure.toFixed(0)} N/m²</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Historial de Cálculos
            </div>
            <Button variant="outline" size="sm" onClick={clearHistory}>
              <Trash2 className="w-4 h-4" />
              Limpiar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {calculationHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No hay cálculos en el historial. Modifica los valores para generar resultados.
              </p>
            ) : (
              calculationHistory
                .slice()
                .reverse()
                .map((result) => (
                  <div
                    key={result.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                      selectedHistoryItem === result.id ? "bg-primary/10 border-primary" : "bg-muted/20"
                    }`}
                    onClick={() => loadFromHistory(result)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium">
                        h = {result.depth.toFixed(2)}m, ρ = {result.fluidDensity} kg/m³
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {(result.pressure / 1000).toFixed(2)} kPa
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{result.formula}</div>
                    <div className="text-xs text-muted-foreground mt-1">{result.timestamp.toLocaleTimeString()}</div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Theory */}
      <Card>
        <CardHeader>
          <CardTitle>Teoría: Presión en Fluidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Fórmula de Presión Hidrostática</h4>
              <p className="text-muted-foreground mb-2 font-mono">P = ρgh + P₀</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• P = Presión total (Pa)</li>
                <li>• ρ = Densidad del fluido (kg/m³)</li>
                <li>• g = Aceleración gravitacional (9.81 m/s²)</li>
                <li>• h = Profundidad (m)</li>
                <li>• P₀ = Presión atmosférica (101325 Pa)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Conceptos Clave</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• La presión aumenta linealmente con la profundidad</li>
                <li>• Fluidos más densos generan mayor presión</li>
                <li>• La presión actúa en todas las direcciones</li>
                <li>• 1 kPa = 1000 Pa = 1000 N/m²</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
