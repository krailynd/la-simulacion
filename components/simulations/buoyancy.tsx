"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RotateCcw, Play, Pause, Calculator, Beaker, Target } from "lucide-react"

const materials = {
  wood: { name: "Madera", density: 600, color: "#92400e" },
  ice: { name: "Hielo", density: 917, color: "#e0f2fe" },
  water: { name: "Agua", density: 1000, color: "#0ea5e9" },
  aluminum: { name: "Aluminio", density: 2700, color: "#64748b" },
  iron: { name: "Hierro", density: 7800, color: "#374151" },
  lead: { name: "Plomo", density: 11340, color: "#1f2937" },
}

const fluids = {
  mercury: { name: "Mercurio", density: 13534, color: "#9ca3af" },
  water: { name: "Agua", density: 1000, color: "#06b6d4" },
  oil: { name: "Aceite", density: 800, color: "#fbbf24" },
  alcohol: { name: "Alcohol", density: 789, color: "#c084fc" },
  gasoline: { name: "Gasolina", density: 680, color: "#f87171" },
}

export function BuoyancySimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  const [objectMaterial, setObjectMaterial] = useState("wood")
  const [objectVolume, setObjectVolume] = useState([0.001]) // m³
  const [fluidType, setFluidType] = useState("water")
  const [isPlaying, setIsPlaying] = useState(false)
  const [objectPosition, setObjectPosition] = useState(100)
  const [velocity, setVelocity] = useState(0)

  const [customDensity, setCustomDensity] = useState("")
  const [targetBuoyancy, setTargetBuoyancy] = useState("")
  const [calculatedVolume, setCalculatedVolume] = useState(0)
  const [showCalculations, setShowCalculations] = useState(false)
  const [forceHistory, setForceHistory] = useState<{ time: number; buoyant: number; weight: number }[]>([])

  const material = materials[objectMaterial as keyof typeof materials]
  const fluid = fluids[fluidType as keyof typeof fluids]
  const fluidDensity = customDensity ? Number.parseFloat(customDensity) : fluid.density

  const objectMass = material.density * objectVolume[0]
  const buoyantForce = fluidDensity * 9.81 * objectVolume[0]
  const weight = objectMass * 9.81
  const netForce = buoyantForce - weight

  const submergedPercentage = Math.min(100, Math.max(0, (material.density / fluidDensity) * 100))

  useEffect(() => {
    setForceHistory((prev) => {
      const newHistory = [
        ...prev,
        {
          time: Date.now(),
          buoyant: buoyantForce,
          weight: weight,
        },
      ]
      return newHistory.slice(-50) // Keep last 50 measurements
    })
  }, [buoyantForce, weight])

  const calculateVolumeForBuoyancy = () => {
    if (!targetBuoyancy) return
    const targetForce = Number.parseFloat(targetBuoyancy)
    const requiredVolume = targetForce / (fluidDensity * 9.81)
    setCalculatedVolume(requiredVolume)
    setObjectVolume([Math.max(0.0001, Math.min(0.005, requiredVolume))])
  }

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        const acceleration = netForce / objectMass
        setVelocity((prev) => {
          const newVelocity = prev + acceleration * (1 / 60) // 60fps timestep
          return newVelocity * 0.995 // Improved damping for realistic motion
        })

        setObjectPosition((prev) => {
          const newPos = prev - velocity * 2
          // Enhanced boundaries with proper surface interaction
          if (newPos < 60) return 60 // Surface with margin
          if (newPos > 220) return 220 // Bottom with margin
          return newPos
        })

        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, netForce, objectMass, velocity])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw container with enhanced styling
    ctx.strokeStyle = "#374151"
    ctx.lineWidth = 4
    ctx.strokeRect(50, 50, 300, 250)

    // Add container shadow and depth
    ctx.shadowColor = "rgba(0,0,0,0.2)"
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    ctx.strokeRect(50, 50, 300, 250)
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // Enhanced fluid rendering with realistic colors and gradients
    const fluidGradient = ctx.createLinearGradient(0, 52, 0, 298)

    // Determine fluid color based on type and density
    let fluidColor1, fluidColor2
    if (fluidType === "mercury") {
      fluidColor1 = "rgba(156, 163, 175, 0.8)"
      fluidColor2 = "rgba(107, 114, 128, 0.9)"
    } else if (fluidType === "oil") {
      fluidColor1 = "rgba(251, 191, 36, 0.7)"
      fluidColor2 = "rgba(245, 158, 11, 0.9)"
    } else if (fluidType === "alcohol") {
      fluidColor1 = "rgba(192, 132, 252, 0.6)"
      fluidColor2 = "rgba(147, 51, 234, 0.8)"
    } else if (fluidType === "gasoline") {
      fluidColor1 = "rgba(248, 113, 113, 0.6)"
      fluidColor2 = "rgba(239, 68, 68, 0.8)"
    } else {
      // water
      fluidColor1 = "rgba(6, 182, 212, 0.7)"
      fluidColor2 = "rgba(8, 145, 178, 0.9)"
    }

    fluidGradient.addColorStop(0, fluidColor1)
    fluidGradient.addColorStop(1, fluidColor2)
    ctx.fillStyle = fluidGradient
    ctx.fillRect(52, 52, 296, 246)

    // Enhanced scale with better visibility
    ctx.strokeStyle = "#64748b"
    ctx.lineWidth = 2
    ctx.font = "11px monospace"
    ctx.fillStyle = "#374151"

    for (let i = 0; i <= 10; i++) {
      const y = 52 + i * 24.6
      ctx.setLineDash([4, 2])
      ctx.beginPath()
      ctx.moveTo(52, y)
      ctx.lineTo(68, y)
      ctx.stroke()

      // Add depth markers
      const depth = (10 - i) * 0.25 // 2.5m total depth
      ctx.fillText(`${depth.toFixed(1)}m`, 25, y + 4)
    }
    ctx.setLineDash([])

    // Enhanced object rendering with proper 3D effect
    const objectSize = Math.cbrt(objectVolume[0] * 1000000) * 25 // Improved size calculation
    const submergedHeight = (objectSize * submergedPercentage) / 100

    // Object shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
    ctx.fillRect(202 - objectSize / 2, objectPosition + 2, objectSize, objectSize)

    // Main object
    const objectGradient = ctx.createLinearGradient(
      200 - objectSize / 2,
      objectPosition,
      200 + objectSize / 2,
      objectPosition + objectSize,
    )
    objectGradient.addColorStop(0, material.color)
    objectGradient.addColorStop(1, material.color + "CC") // Add transparency

    ctx.fillStyle = objectGradient
    ctx.fillRect(200 - objectSize / 2, objectPosition, objectSize, objectSize)

    // Highlight submerged portion with water effect
    if (submergedHeight > 0) {
      const submergedGradient = ctx.createLinearGradient(
        200 - objectSize / 2,
        objectPosition + objectSize - submergedHeight,
        200 + objectSize / 2,
        objectPosition + objectSize,
      )
      submergedGradient.addColorStop(0, fluidColor1)
      submergedGradient.addColorStop(1, fluidColor2)

      ctx.globalCompositeOperation = "multiply"
      ctx.fillStyle = submergedGradient
      ctx.fillRect(200 - objectSize / 2, objectPosition + objectSize - submergedHeight, objectSize, submergedHeight)
      ctx.globalCompositeOperation = "source-over"
    }

    // Enhanced force arrows with better proportions
    const maxForceScale = 0.0008
    const weightArrowLength = Math.min(weight * maxForceScale, 100)
    const buoyantArrowLength = Math.min(buoyantForce * maxForceScale, 100)

    // Weight arrow (downward) - enhanced design
    ctx.strokeStyle = "#ef4444"
    ctx.lineWidth = 5
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(200, objectPosition + objectSize / 2)
    ctx.lineTo(200, objectPosition + objectSize / 2 + weightArrowLength)
    ctx.stroke()

    // Weight arrow head
    ctx.fillStyle = "#ef4444"
    ctx.beginPath()
    ctx.moveTo(200, objectPosition + objectSize / 2 + weightArrowLength)
    ctx.lineTo(190, objectPosition + objectSize / 2 + weightArrowLength - 12)
    ctx.lineTo(210, objectPosition + objectSize / 2 + weightArrowLength - 12)
    ctx.closePath()
    ctx.fill()

    // Buoyant force arrow (upward) - enhanced design
    ctx.strokeStyle = "#10b981"
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(230, objectPosition + objectSize / 2)
    ctx.lineTo(230, objectPosition + objectSize / 2 - buoyantArrowLength)
    ctx.stroke()

    // Buoyant arrow head
    ctx.fillStyle = "#10b981"
    ctx.beginPath()
    ctx.moveTo(230, objectPosition + objectSize / 2 - buoyantArrowLength)
    ctx.lineTo(220, objectPosition + objectSize / 2 - buoyantArrowLength + 12)
    ctx.lineTo(240, objectPosition + objectSize / 2 - buoyantArrowLength + 12)
    ctx.closePath()
    ctx.fill()

    // Enhanced force labels with better positioning
    ctx.fillStyle = "#374151"
    ctx.font = "bold 12px sans-serif"
    ctx.fillText(`Peso: ${weight.toFixed(1)}N`, 150, objectPosition + objectSize / 2 + weightArrowLength + 25)
    ctx.fillText(`Empuje: ${buoyantForce.toFixed(1)}N`, 250, objectPosition + objectSize / 2 - buoyantArrowLength - 10)

    // Enhanced information display
    ctx.font = "bold 14px sans-serif"
    ctx.fillText(`Material: ${material.name}`, 380, 80)
    ctx.fillText(`ρ_objeto = ${material.density} kg/m³`, 380, 100)
    ctx.fillText(`ρ_fluido = ${fluidDensity} kg/m³`, 380, 120)
    ctx.fillText(`Volumen = ${(objectVolume[0] * 1000).toFixed(1)} L`, 380, 140)
    ctx.fillText(`Sumergido: ${submergedPercentage.toFixed(1)}%`, 380, 160)

    // Enhanced status with color coding
    const status = Math.abs(netForce) < 0.1 ? "⚖️ Equilibrio" : netForce > 0 ? "⬆️ Flotando" : "⬇️ Hundiéndose"
    const statusColor = Math.abs(netForce) < 0.1 ? "#f59e0b" : netForce > 0 ? "#10b981" : "#ef4444"

    ctx.fillStyle = statusColor
    ctx.font = "bold 16px sans-serif"
    ctx.fillText(`Estado: ${status}`, 380, 185)

    // Add water displacement visualization
    if (submergedHeight > 0) {
      const displacedVolume = objectVolume[0] * (submergedPercentage / 100)
      ctx.fillStyle = "#6b7280"
      ctx.font = "12px sans-serif"
      ctx.fillText(`Vol. desplazado: ${(displacedVolume * 1000).toFixed(1)} L`, 380, 205)
    }
  }, [
    objectPosition,
    objectVolume,
    material,
    weight,
    buoyantForce,
    fluid,
    fluidDensity,
    submergedPercentage,
    netForce,
    fluidType,
  ])

  const reset = () => {
    setObjectMaterial("wood")
    setObjectVolume([0.001])
    setFluidType("water")
    setCustomDensity("")
    setIsPlaying(false)
    setObjectPosition(100)
    setVelocity(0)
    setForceHistory([])
    setTargetBuoyancy("")
    setCalculatedVolume(0)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Canvas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Simulación de Flotabilidad - Principio de Arquímedes
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

        {/* Enhanced Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Controles Interactivos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Material del Objeto</label>
              <Select value={objectMaterial} onValueChange={setObjectMaterial}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(materials).map(([key, mat]) => (
                    <SelectItem key={key} value={key}>
                      {mat.name} ({mat.density} kg/m³)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Beaker className="w-4 h-4" />
                Tipo de Fluido
              </label>
              <Select value={fluidType} onValueChange={setFluidType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(fluids).map(([key, fluid]) => (
                    <SelectItem key={key} value={key}>
                      {fluid.name} ({fluid.density} kg/m³)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Densidad Personalizada (kg/m³)</label>
              <Input
                type="number"
                placeholder="Opcional - sobrescribe fluido seleccionado"
                value={customDensity}
                onChange={(e) => setCustomDensity(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Volumen: {(objectVolume[0] * 1000).toFixed(1)} L</label>
              <Slider
                value={objectVolume}
                onValueChange={setObjectVolume}
                max={0.005}
                min={0.0001}
                step={0.0001}
                className="w-full"
              />
            </div>

            <div className="space-y-3 border-t pt-4">
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Calculadora de Empuje
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Empuje objetivo (N)"
                  value={targetBuoyancy}
                  onChange={(e) => setTargetBuoyancy(e.target.value)}
                  className="text-sm"
                />
                <Button size="sm" onClick={calculateVolumeForBuoyancy}>
                  Calcular
                </Button>
              </div>
              {calculatedVolume > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Volumen requerido: {(calculatedVolume * 1000).toFixed(1)} L
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Análisis de Fuerzas</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Peso (mg):</span>
                  <Badge variant="destructive">{weight.toFixed(2)} N</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Empuje (ρVg):</span>
                  <Badge variant="secondary">{buoyantForce.toFixed(2)} N</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Fuerza Neta:</span>
                  <Badge variant={netForce > 0 ? "default" : "outline"}>{netForce.toFixed(2)} N</Badge>
                </div>
                <div className="flex justify-between">
                  <span>% Sumergido:</span>
                  <Badge variant="outline">{submergedPercentage.toFixed(1)}%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showCalculations && (
        <Card>
          <CardHeader>
            <CardTitle>Cálculos Matemáticos Detallados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Cálculo del Empuje (Principio de Arquímedes):</h4>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                  <div>F_empuje = ρ_fluido × g × V_sumergido</div>
                  <div>
                    F_empuje = {fluidDensity} × 9.81 × {objectVolume[0].toFixed(6)}
                  </div>
                  <div className="font-bold">F_empuje = {buoyantForce.toFixed(3)} N</div>
                  <div className="mt-3 pt-3 border-t">
                    <div>Peso = m × g = ρ_objeto × V × g</div>
                    <div>
                      Peso = {material.density} × {objectVolume[0].toFixed(6)} × 9.81
                    </div>
                    <div className="font-bold">Peso = {weight.toFixed(3)} N</div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div>Fuerza Neta = F_empuje - Peso</div>
                    <div className="font-bold">F_neta = {netForce.toFixed(3)} N</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Análisis de Densidades:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between bg-muted p-2 rounded">
                    <span>Densidad Objeto:</span>
                    <span>{material.density} kg/m³</span>
                  </div>
                  <div className="flex justify-between bg-muted p-2 rounded">
                    <span>Densidad Fluido:</span>
                    <span>{fluidDensity} kg/m³</span>
                  </div>
                  <div className="flex justify-between bg-muted p-2 rounded">
                    <span>Ratio ρ_obj/ρ_fluid:</span>
                    <span>{(material.density / fluidDensity).toFixed(3)}</span>
                  </div>
                  <div className="mt-3 p-3 bg-primary/10 rounded">
                    <div className="font-medium">Predicción:</div>
                    <div className="text-xs mt-1">
                      {material.density < fluidDensity
                        ? "🟢 El objeto flotará"
                        : material.density > fluidDensity
                          ? "🔴 El objeto se hundirá"
                          : "🟡 El objeto estará en equilibrio"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Theory */}
      <Card>
        <CardHeader>
          <CardTitle>Principio de Arquímedes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Fuerza de Empuje</h4>
              <p className="text-muted-foreground mb-2">F_empuje = ρ_fluido × g × V_sumergido</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• ρ_fluido = Densidad del fluido</li>
                <li>• g = Aceleración gravitacional</li>
                <li>• V_sumergido = Volumen sumergido</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Condiciones de Flotación</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>
                  • <strong>Flota:</strong> ρ_objeto {"<"} ρ_fluido
                </li>
                <li>
                  • <strong>Se hunde:</strong> ρ_objeto {">"} ρ_fluido
                </li>
                <li>
                  • <strong>Equilibrio:</strong> ρ_objeto = ρ_fluido
                </li>
                <li>• El empuje es igual al peso del fluido desplazado</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
