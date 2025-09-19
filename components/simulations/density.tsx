"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RotateCcw, Scale } from "lucide-react"

const substances = {
  air: { name: "Aire", density: 1.2, color: "#f3f4f6" },
  water: { name: "Agua", density: 1000, color: "#3b82f6" },
  oil: { name: "Aceite", density: 800, color: "#fbbf24" },
  honey: { name: "Miel", density: 1400, color: "#f59e0b" },
  mercury: { name: "Mercurio", density: 13534, color: "#6b7280" },
  wood: { name: "Madera", density: 600, color: "#92400e" },
  aluminum: { name: "Aluminio", density: 2700, color: "#64748b" },
  iron: { name: "Hierro", density: 7800, color: "#374151" },
}

export function DensitySimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [substance1, setSubstance1] = useState("water")
  const [substance2, setSubstance2] = useState("oil")
  const [volume1, setVolume1] = useState([100]) // mL
  const [volume2, setVolume2] = useState([100]) // mL
  const [temperature, setTemperature] = useState([20]) // °C
  const [showMass, setShowMass] = useState(true)

  const sub1 = substances[substance1 as keyof typeof substances]
  const sub2 = substances[substance2 as keyof typeof substances]

  // Temperature effect on density (simplified)
  const tempFactor1 = 1 - (temperature[0] - 20) * 0.0002
  const tempFactor2 = 1 - (temperature[0] - 20) * 0.0002

  const density1 = sub1.density * tempFactor1
  const density2 = sub2.density * tempFactor2

  const mass1 = (density1 * volume1[0]) / 1000 // kg
  const mass2 = (density2 * volume2[0]) / 1000 // kg

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw container
    ctx.strokeStyle = "#374151"
    ctx.lineWidth = 3
    ctx.strokeRect(100, 50, 150, 250)

    // Determine layer order based on density
    const layers = [
      { substance: sub1, density: density1, volume: volume1[0], name: substance1 },
      { substance: sub2, density: density2, volume: volume2[0], name: substance2 },
    ].sort((a, b) => b.density - a.density) // Heavier at bottom

    let currentHeight = 300
    const totalVolume = volume1[0] + volume2[0]

    layers.forEach((layer, index) => {
      const layerHeight = (layer.volume / totalVolume) * 200
      currentHeight -= layerHeight

      // Draw layer
      ctx.fillStyle = layer.substance.color
      ctx.globalAlpha = 0.8
      ctx.fillRect(102, currentHeight, 146, layerHeight)
      ctx.globalAlpha = 1

      // Draw label
      ctx.fillStyle = "#374151"
      ctx.font = "12px sans-serif"
      ctx.fillText(layer.substance.name, 270, currentHeight + layerHeight / 2)
      ctx.fillText(`${layer.density.toFixed(0)} kg/m³`, 270, currentHeight + layerHeight / 2 + 15)
    })

    // Draw measurement tools
    if (showMass) {
      // Scale
      ctx.strokeStyle = "#374151"
      ctx.lineWidth = 2
      ctx.strokeRect(350, 200, 80, 20)
      ctx.fillStyle = "#f59e0b"
      ctx.fillRect(352, 202, 76, 16)

      ctx.fillStyle = "#374151"
      ctx.font = "12px sans-serif"
      ctx.fillText("Balanza", 350, 195)
      ctx.fillText(`${(mass1 + mass2).toFixed(2)} kg`, 350, 240)
    }

    // Draw density tower reference
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])
    for (let i = 1; i < 5; i++) {
      const y = 50 + i * 50
      ctx.beginPath()
      ctx.moveTo(100, y)
      ctx.lineTo(250, y)
      ctx.stroke()
    }
    ctx.setLineDash([])
  }, [substance1, substance2, volume1, volume2, density1, density2, mass1, mass2, showMass])

  const reset = () => {
    setSubstance1("water")
    setSubstance2("oil")
    setVolume1([100])
    setVolume2([100])
    setTemperature([20])
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Canvas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Torre de Densidad
              <div className="flex gap-2">
                <Button variant={showMass ? "default" : "outline"} size="sm" onClick={() => setShowMass(!showMass)}>
                  <Scale className="w-4 h-4" />
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

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Controles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Sustancia 1</label>
              <Select value={substance1} onValueChange={setSubstance1}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(substances).map(([key, sub]) => (
                    <SelectItem key={key} value={key}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Volumen 1: {volume1[0]} mL</label>
              <Slider value={volume1} onValueChange={setVolume1} max={200} min={10} step={10} className="w-full" />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Sustancia 2</label>
              <Select value={substance2} onValueChange={setSubstance2}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(substances).map(([key, sub]) => (
                    <SelectItem key={key} value={key}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Volumen 2: {volume2[0]} mL</label>
              <Slider value={volume2} onValueChange={setVolume2} max={200} min={10} step={10} className="w-full" />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Temperatura: {temperature[0]}°C</label>
              <Slider
                value={temperature}
                onValueChange={setTemperature}
                max={100}
                min={-10}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Propiedades</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{sub1.name}:</span>
                  <Badge variant="secondary">{density1.toFixed(0)} kg/m³</Badge>
                </div>
                <div className="flex justify-between">
                  <span>{sub2.name}:</span>
                  <Badge variant="secondary">{density2.toFixed(0)} kg/m³</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Masa Total:</span>
                  <Badge variant="outline">{(mass1 + mass2).toFixed(2)} kg</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Theory */}
      <Card>
        <CardHeader>
          <CardTitle>Conceptos de Densidad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Definición</h4>
              <p className="text-muted-foreground mb-2">ρ = m/V</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• ρ = Densidad (kg/m³)</li>
                <li>• m = Masa (kg)</li>
                <li>• V = Volumen (m³)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Estratificación</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Los fluidos se separan por densidad</li>
                <li>• El más denso queda abajo</li>
                <li>• Forma capas estables</li>
                <li>• No se mezclan fácilmente</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Factores que Afectan</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Temperatura (↑T → ↓ρ)</li>
                <li>• Presión (↑P → ↑ρ)</li>
                <li>• Composición química</li>
                <li>• Estado de agregación</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
