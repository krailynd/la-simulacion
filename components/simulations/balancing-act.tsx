"use client"

// Importaciones de React hooks para manejo de estado y efectos
import { useState, useEffect, useRef, useCallback } from "react"
// Importaciones de componentes UI de shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
// Iconos de Lucide React para la interfaz
import { RotateCcw, Play, Pause, History, Trash2, Moon, Sun, Scale } from "lucide-react"

// Interfaz TypeScript para definir las propiedades de una masa
interface Mass {
  weight: number // Peso en kg
  position: number // Posición desde el centro en metros
  color: string // Color para visualización
  id: string // Identificador único
}

// Interfaz para almacenar resultados de cálculos en el historial
interface BalanceResult {
  id: number // ID único del cálculo
  leftMass: number // Masa izquierda en kg
  rightMass: number // Masa derecha en kg
  leftPosition: number // Posición izquierda desde el centro en m
  rightPosition: number // Posición derecha desde el centro en m
  leftTorque: number // Torque izquierdo en N⋅m
  rightTorque: number // Torque derecho en N⋅m
  netTorque: number // Torque neto en N⋅m
  isBalanced: boolean // Si está en equilibrio
  timestamp: Date // Momento del cálculo
  formula: string // Fórmula utilizada para el cálculo
}

// Componente principal de la simulación de equilibrio estilo PhET
export function BalancingActSimulation() {
  // Referencia al elemento canvas para dibujar la simulación
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Referencia para controlar la animación con requestAnimationFrame
  const animationRef = useRef<number>()

  // Estados para los parámetros de la simulación (usando arrays para compatibilidad con Slider)
  const [leftMass, setLeftMass] = useState([10]) // Masa izquierda en kg
  const [rightMass, setRightMass] = useState([10]) // Masa derecha en kg
  const [leftPosition, setLeftPosition] = useState([2]) // Posición izquierda desde el centro en m
  const [rightPosition, setRightPosition] = useState([2]) // Posición derecha desde el centro en m

  // Estados de control de la simulación
  const [isPlaying, setIsPlaying] = useState(false) // Estado de reproducción de la animación
  const [balanceAngle, setBalanceAngle] = useState(0) // Ángulo de inclinación de la viga
  const [isDarkMode, setIsDarkMode] = useState(false) // Modo oscuro
  const [showForces, setShowForces] = useState(true) // Mostrar vectores de fuerza
  const [showTorques, setShowTorques] = useState(true) // Mostrar indicadores de torque
  const [showGrid, setShowGrid] = useState(true) // Mostrar líneas de referencia

  // Estados para campos de entrada interactivos
  const [leftMassInput, setLeftMassInput] = useState("10") // Campo de texto para masa izquierda
  const [rightMassInput, setRightMassInput] = useState("10") // Campo de texto para masa derecha
  const [leftPosInput, setLeftPosInput] = useState("2") // Campo de texto para posición izquierda
  const [rightPosInput, setRightPosInput] = useState("2") // Campo de texto para posición derecha

  // Estados para historial de cálculos
  const [balanceHistory, setBalanceHistory] = useState<BalanceResult[]>([]) // Historial de cálculos
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<number | null>(null) // Item seleccionado del historial
  const [showCalculations, setShowCalculations] = useState(false) // Mostrar/ocultar panel de cálculos

  // Cálculos físicos basados en los parámetros actuales
  const leftTorque = leftMass[0] * 9.81 * leftPosition[0] // Torque izquierdo: τ = m × g × d
  const rightTorque = rightMass[0] * 9.81 * rightPosition[0] // Torque derecho: τ = m × g × d
  const netTorque = rightTorque - leftTorque // Torque neto (positivo = gira hacia la derecha)
  const isBalanced = Math.abs(netTorque) < 1 // Considerar equilibrado si el torque neto es menor a 1 N⋅m

  // <-- EDITABLE: Colores del tema - puedes cambiar estos valores para personalizar la apariencia
  const colors = {
    // Colores del fondo (estilo PhET)
    skyTop: isDarkMode ? "#1e293b" : "#87ceeb", // Azul cielo
    skyBottom: isDarkMode ? "#334155" : "#e0f6ff", // Azul más claro
    ground: isDarkMode ? "#166534" : "#90ee90", // Verde claro
    groundDark: isDarkMode ? "#14532d" : "#228b22", // Verde más oscuro

    // Colores de la viga y fulcro
    beam: isDarkMode ? "#92400e" : "#8b4513", // Marrón para la viga
    fulcrum: isDarkMode ? "#374151" : "#2d3748", // Gris oscuro para el fulcro

    // Colores de las masas
    leftMass: isDarkMode ? "#dc2626" : "#ff4444", // Rojo para masa izquierda
    rightMass: isDarkMode ? "#2563eb" : "#4488ff", // Azul para masa derecha

    // Colores de vectores y fuerzas
    leftForce: isDarkMode ? "#ef4444" : "#ff0000", // Rojo para fuerza izquierda
    rightForce: isDarkMode ? "#3b82f6" : "#0000ff", // Azul para fuerza derecha

    // Colores de UI
    text: isDarkMode ? "#f1f5f9" : "#1e293b",
    textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
    grid: isDarkMode ? "#475569" : "#cbd5e1",
  }

  // Función para manejar cambios en el campo de masa izquierda
  const handleLeftMassInputChange = (value: string) => {
    setLeftMassInput(value) // Actualizar el valor del campo de texto
    const numValue = Number.parseFloat(value) // Convertir a número
    // Validar que esté en el rango permitido
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 50) {
      setLeftMass([numValue]) // Actualizar el estado si es válido
    }
  }

  // Función para manejar cambios en el campo de masa derecha
  const handleRightMassInputChange = (value: string) => {
    setRightMassInput(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 50) {
      setRightMass([numValue])
    }
  }

  // Función para manejar cambios en el campo de posición izquierda
  const handleLeftPosInputChange = (value: string) => {
    setLeftPosInput(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0.5 && numValue <= 4) {
      setLeftPosition([numValue])
    }
  }

  // Función para manejar cambios en el campo de posición derecha
  const handleRightPosInputChange = (value: string) => {
    setRightPosInput(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0.5 && numValue <= 4) {
      setRightPosition([numValue])
    }
  }

  // Función para agregar un resultado al historial de cálculos
  const addToHistory = useCallback(() => {
    const newResult: BalanceResult = {
      id: Date.now(), // ID único basado en timestamp
      leftMass: leftMass[0],
      rightMass: rightMass[0],
      leftPosition: leftPosition[0],
      rightPosition: rightPosition[0],
      leftTorque: leftTorque,
      rightTorque: rightTorque,
      netTorque: netTorque,
      isBalanced: isBalanced,
      timestamp: new Date(),
      // Fórmula matemática formateada para mostrar
      formula: `τ_izq = ${leftMass[0]}kg × 9.81m/s² × ${leftPosition[0]}m = ${leftTorque.toFixed(1)}N⋅m`,
    }
    // Mantener solo los últimos 20 resultados
    setBalanceHistory((prev) => [...prev.slice(-19), newResult])
  }, [leftMass, rightMass, leftPosition, rightPosition, leftTorque, rightTorque, netTorque, isBalanced])

  // Función para cargar parámetros desde el historial con animación suave
  const loadFromHistory = (result: BalanceResult) => {
    setSelectedHistoryItem(result.id) // Marcar como seleccionado

    // Valores iniciales para la animación
    const startLeftMass = leftMass[0]
    const startRightMass = rightMass[0]
    const startLeftPos = leftPosition[0]
    const startRightPos = rightPosition[0]

    let progress = 0 // Progreso de la animación (0 a 1)
    // Función de animación recursiva
    const animateToHistory = () => {
      progress += 0.05 // Incrementar progreso
      if (progress <= 1) {
        // Interpolación lineal entre valores inicial y final
        const currentLeftMass = startLeftMass + (result.leftMass - startLeftMass) * progress
        const currentRightMass = startRightMass + (result.rightMass - startRightMass) * progress
        const currentLeftPos = startLeftPos + (result.leftPosition - startLeftPos) * progress
        const currentRightPos = startRightPos + (result.rightPosition - startRightPos) * progress

        // Actualizar todos los estados con los valores interpolados
        setLeftMass([currentLeftMass])
        setRightMass([currentRightMass])
        setLeftPosition([currentLeftPos])
        setRightPosition([currentRightPos])
        setLeftMassInput(currentLeftMass.toFixed(1))
        setRightMassInput(currentRightMass.toFixed(1))
        setLeftPosInput(currentLeftPos.toFixed(1))
        setRightPosInput(currentRightPos.toFixed(1))

        // Continuar la animación en el siguiente frame
        requestAnimationFrame(animateToHistory)
      } else {
        // Animación completada
        setSelectedHistoryItem(null)
      }
    }
    animateToHistory() // Iniciar la animación
  }

  // Efecto para actualizar el ángulo de balance basado en el torque neto
  useEffect(() => {
    if (isPlaying) {
      // Calcular ángulo objetivo basado en el torque neto (máximo ±30 grados)
      const targetAngle = Math.max(-30, Math.min(30, netTorque * 0.3))
      let animationId: number

      // Función de animación suave a 60fps
      const animate = () => {
        setBalanceAngle((prev) => {
          const diff = targetAngle - prev // Diferencia entre ángulo actual y objetivo
          const newAngle = prev + diff * 0.08 // Interpolación suave (8% por frame)

          // Continuar animación si la diferencia es significativa
          if (Math.abs(diff) > 0.1) {
            animationId = requestAnimationFrame(animate)
          } else {
            // Agregar al historial cuando se estabilice
            addToHistory()
          }

          return newAngle
        })
      }

      // Iniciar la animación
      animationId = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationId) // Cleanup
    }
  }, [netTorque, isPlaying, addToHistory])

  // Efecto para dibujar en el canvas estilo PhET (se ejecuta en cada cambio de estado)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Configurar renderizado de alta calidad
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    // Limpiar el canvas completamente
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // <-- EDITABLE: Fondo del canvas estilo PhET - puedes cambiar los colores del gradiente
    // Dibujar fondo del cielo con gradiente
    const skyGradient = ctx.createLinearGradient(0, 0, 0, 250)
    skyGradient.addColorStop(0, colors.skyTop) // Azul cielo
    skyGradient.addColorStop(1, colors.skyBottom) // Azul más claro
    ctx.fillStyle = skyGradient
    ctx.fillRect(0, 0, canvas.width, 250)

    // <-- EDITABLE: Color del suelo - puedes cambiar por otros colores
    // Dibujar suelo con gradiente
    const groundGradient = ctx.createLinearGradient(0, 250, 0, canvas.height)
    groundGradient.addColorStop(0, colors.ground) // Verde claro
    groundGradient.addColorStop(1, colors.groundDark) // Verde más oscuro
    ctx.fillStyle = groundGradient
    ctx.fillRect(0, 250, canvas.width, canvas.height - 250)

    // Constantes para el dibujo
    const centerX = 300 // Centro horizontal del canvas
    const centerY = 200 // Centro vertical (punto de apoyo)
    const beamLength = 200 // Longitud de la viga en píxeles
    const scale = 50 // Escala: 50 píxeles = 1 metro

    // Dibujar líneas de referencia si están habilitadas
    if (showGrid) {
      // <-- EDITABLE: Color de las líneas de referencia
      ctx.strokeStyle = colors.grid // Color de grilla adaptable al tema
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3]) // Línea punteada

      // Líneas verticales de posición cada metro
      for (let i = -4; i <= 4; i++) {
        if (i === 0) continue // Saltar el centro
        const x = centerX + i * scale
        ctx.beginPath()
        ctx.moveTo(x, centerY - 60)
        ctx.lineTo(x, centerY + 60)
        ctx.stroke()

        // Etiquetas de posición
        ctx.fillStyle = colors.textSecondary
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`${Math.abs(i)}m`, x, centerY + 80)
      }
      ctx.setLineDash([]) // Resetear línea punteada
    }

    // <-- EDITABLE: Color del fulcro - puedes cambiar por otros colores
    // Dibujar fulcro (punto de apoyo) como triángulo
    ctx.fillStyle = colors.fulcrum // Gris oscuro
    ctx.beginPath()
    ctx.moveTo(centerX - 25, centerY + 25) // Esquina inferior izquierda
    ctx.lineTo(centerX + 25, centerY + 25) // Esquina inferior derecha
    ctx.lineTo(centerX, centerY) // Punta superior (punto de apoyo)
    ctx.closePath()
    ctx.fill()

    // Dibujar sombra del fulcro para efecto 3D
    ctx.fillStyle = isDarkMode ? "#1f2937" : "#4a5568"
    ctx.beginPath()
    ctx.moveTo(centerX - 20, centerY + 20)
    ctx.lineTo(centerX + 20, centerY + 20)
    ctx.lineTo(centerX, centerY + 5)
    ctx.closePath()
    ctx.fill()

    // Dibujar viga (rotada según el ángulo de balance)
    ctx.save() // Guardar estado del contexto
    ctx.translate(centerX, centerY) // Mover origen al punto de apoyo
    ctx.rotate((balanceAngle * Math.PI) / 180) // Rotar según el ángulo de balance

    // <-- EDITABLE: Color de la viga - puedes cambiar por otros colores
    // Dibujar viga principal
    ctx.fillStyle = colors.beam // Marrón para la viga
    ctx.fillRect(-beamLength, -8, beamLength * 2, 16) // Viga horizontal

    // Dibujar detalles de la viga (vetas de madera)
    ctx.fillStyle = isDarkMode ? "#7c2d12" : "#a0522d"
    ctx.fillRect(-beamLength, -6, beamLength * 2, 3)
    ctx.fillRect(-beamLength, 3, beamLength * 2, 3)

    // Calcular posiciones de las masas en la viga rotada
    const leftX = -leftPosition[0] * scale // Posición izquierda (negativa)
    const rightX = rightPosition[0] * scale // Posición derecha (positiva)

    // <-- EDITABLE: Colores de las masas - puedes cambiar por otros colores
    // Dibujar masa izquierda
    ctx.fillStyle = colors.leftMass // Rojo para masa izquierda
    ctx.fillRect(leftX - 20, -35, 40, 30) // Rectángulo de la masa
    // Sombra de la masa izquierda
    ctx.fillStyle = isDarkMode ? "#991b1b" : "#cc3333"
    ctx.fillRect(leftX - 18, -33, 36, 26)

    // Dibujar masa derecha
    ctx.fillStyle = colors.rightMass // Azul para masa derecha
    ctx.fillRect(rightX - 20, -35, 40, 30) // Rectángulo de la masa
    // Sombra de la masa derecha
    ctx.fillStyle = isDarkMode ? "#1d4ed8" : "#3366cc"
    ctx.fillRect(rightX - 18, -33, 36, 26)

    ctx.restore() // Restaurar estado del contexto

    // Dibujar vectores de fuerza si están habilitados
    if (showForces) {
      const leftForce = leftMass[0] * 9.81 // Fuerza de la masa izquierda (peso)
      const rightForce = rightMass[0] * 9.81 // Fuerza de la masa derecha (peso)
      const forceScale = 3 // Escala para visualizar las fuerzas

      // Calcular posiciones de las masas considerando la rotación
      const leftMassX =
        centerX - leftPosition[0] * scale * Math.cos((balanceAngle * Math.PI) / 180) + balanceAngle * 1.5
      const leftMassY = centerY - leftPosition[0] * scale * Math.sin((balanceAngle * Math.PI) / 180) - 20

      const rightMassX =
        centerX + rightPosition[0] * scale * Math.cos((balanceAngle * Math.PI) / 180) - balanceAngle * 1.5
      const rightMassY = centerY + rightPosition[0] * scale * Math.sin((balanceAngle * Math.PI) / 180) - 20

      // <-- EDITABLE: Colores de los vectores de fuerza
      // Dibujar vector de fuerza izquierda (peso hacia abajo)
      ctx.strokeStyle = colors.leftForce // Rojo para fuerza izquierda
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(leftMassX, leftMassY)
      ctx.lineTo(leftMassX, leftMassY + leftForce * forceScale)
      ctx.stroke()

      // Punta de flecha para vector izquierdo
      ctx.beginPath()
      ctx.moveTo(leftMassX, leftMassY + leftForce * forceScale)
      ctx.lineTo(leftMassX - 8, leftMassY + leftForce * forceScale - 12)
      ctx.lineTo(leftMassX + 8, leftMassY + leftForce * forceScale - 12)
      ctx.closePath()
      ctx.fillStyle = colors.leftForce
      ctx.fill()

      // Dibujar vector de fuerza derecha (peso hacia abajo)
      ctx.strokeStyle = colors.rightForce // Azul para fuerza derecha
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(rightMassX, rightMassY)
      ctx.lineTo(rightMassX, rightMassY + rightForce * forceScale)
      ctx.stroke()

      // Punta de flecha para vector derecho
      ctx.beginPath()
      ctx.moveTo(rightMassX, rightMassY + rightForce * forceScale)
      ctx.lineTo(rightMassX - 8, rightMassY + rightForce * forceScale - 12)
      ctx.lineTo(rightMassX + 8, rightMassY + rightForce * forceScale - 12)
      ctx.closePath()
      ctx.fillStyle = colors.rightForce
      ctx.fill()

      // Etiquetas de las fuerzas
      ctx.fillStyle = colors.text
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${leftForce.toFixed(0)} N`, leftMassX, leftMassY + leftForce * forceScale + 25)
      ctx.fillText(`${rightForce.toFixed(0)} N`, rightMassX, rightMassY + rightForce * forceScale + 25)
    }

    // <-- EDITABLE: Color del texto de información
    // Mostrar etiquetas de las masas
    ctx.fillStyle = colors.text // Color de texto adaptable al tema
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "center"

    // Calcular posiciones para las etiquetas
    const leftLabelX = centerX - leftPosition[0] * scale * Math.cos((balanceAngle * Math.PI) / 180) + balanceAngle * 1.5
    const leftLabelY = centerY - leftPosition[0] * scale * Math.sin((balanceAngle * Math.PI) / 180) - 45

    const rightLabelX =
      centerX + rightPosition[0] * scale * Math.cos((balanceAngle * Math.PI) / 180) - balanceAngle * 1.5
    const rightLabelY = centerY + rightPosition[0] * scale * Math.sin((balanceAngle * Math.PI) / 180) - 45

    ctx.fillText(`${leftMass[0]} kg`, leftLabelX, leftLabelY)
    ctx.fillText(`${rightMass[0]} kg`, rightLabelX, rightLabelY)

    // Mostrar información de torques si está habilitada
    if (showTorques) {
      ctx.font = "14px sans-serif"
      ctx.textAlign = "left"
      ctx.fillStyle = colors.text

      // Panel de información en la esquina superior izquierda
      ctx.fillStyle = isDarkMode ? "rgba(30, 41, 59, 0.9)" : "rgba(255, 255, 255, 0.9)"
      ctx.fillRect(10, 10, 200, 100)
      ctx.strokeStyle = colors.grid
      ctx.lineWidth = 1
      ctx.strokeRect(10, 10, 200, 100)

      ctx.fillStyle = colors.text
      ctx.fillText(`Torque Izq: ${leftTorque.toFixed(1)} N⋅m`, 20, 30)
      ctx.fillText(`Torque Der: ${rightTorque.toFixed(1)} N⋅m`, 20, 50)
      ctx.fillText(`Torque Neto: ${netTorque.toFixed(1)} N⋅m`, 20, 70)
      ctx.fillText(`Estado: ${isBalanced ? "Equilibrio" : "Desequilibrio"}`, 20, 90)
    }

    // Indicador visual del estado de equilibrio
    const indicatorX = centerX
    const indicatorY = 50
    ctx.beginPath()
    ctx.arc(indicatorX, indicatorY, 15, 0, Math.PI * 2)
    ctx.fillStyle = isBalanced
      ? isDarkMode
        ? "#10b981"
        : "#22c55e" // Verde para equilibrio
      : isDarkMode
        ? "#ef4444"
        : "#f87171" // Rojo para desequilibrio
    ctx.fill()
    ctx.strokeStyle = isDarkMode ? "#374151" : "#6b7280"
    ctx.lineWidth = 2
    ctx.stroke()

    // Texto del indicador
    ctx.fillStyle = colors.text
    ctx.font = "bold 12px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(isBalanced ? "EQUILIBRIO" : "DESEQUILIBRIO", indicatorX, indicatorY - 25)
  }, [
    leftMass,
    rightMass,
    leftPosition,
    rightPosition,
    balanceAngle,
    leftTorque,
    rightTorque,
    netTorque,
    isBalanced,
    showForces,
    showTorques,
    showGrid,
  ])

  // Función para resetear todos los parámetros a valores por defecto
  const reset = () => {
    setLeftMass([10])
    setRightMass([10])
    setLeftPosition([2])
    setRightPosition([2])
    setLeftMassInput("10")
    setRightMassInput("10")
    setLeftPosInput("2")
    setRightPosInput("2")
    setIsPlaying(false)
    setBalanceAngle(0)
  }

  // Función para limpiar el historial de cálculos
  const clearHistory = () => {
    setBalanceHistory([])
  }

  // Renderizado del componente con estilo PhET
  return (
    // <-- EDITABLE: Fondo del contenedor principal - puedes cambiar el tema
    <div className={`space-y-6 transition-colors duration-300 ${isDarkMode ? "dark" : ""}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas de simulación estilo PhET */}
        {/* <-- EDITABLE: Fondo de la tarjeta del canvas */}
        <Card className={`lg:col-span-2 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white"}`}>
          <CardHeader>
            <CardTitle className={`flex items-center justify-between ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Acto de Equilibrio
              <div className="flex gap-2">
                {/* Toggle modo oscuro */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={isDarkMode ? "border-slate-600 text-white hover:bg-slate-700" : ""}
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                {/* Botón de animación */}
                <Button
                  variant={isPlaying ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={isDarkMode && !isPlaying ? "border-slate-600 text-white hover:bg-slate-700" : ""}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                {/* Botón de reset */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                  className={isDarkMode ? "border-slate-600 text-white hover:bg-slate-700" : ""}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Canvas donde se dibuja la simulación estilo PhET */}
            <canvas
              ref={canvasRef}
              width={600}
              height={350}
              className={`border rounded-lg w-full ${isDarkMode ? "border-slate-600" : "border-gray-300"}`}
            />
          </CardContent>
        </Card>

        {/* Panel de controles interactivos estilo PhET */}
        {/* <-- EDITABLE: Fondo del panel de controles */}
        <Card className={isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white"}>
          <CardHeader>
            <CardTitle className={isDarkMode ? "text-white" : "text-gray-900"}>Controles Estilo PhET</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Controles del lado izquierdo */}
            <div className="space-y-4">
              <h4 className={`font-medium text-red-600 ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
                Lado Izquierdo
              </h4>

              {/* Control de masa izquierda */}
              <div className="space-y-3">
                <label className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Masa: {leftMass[0]} kg
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={leftMassInput}
                    onChange={(e) => handleLeftMassInputChange(e.target.value)}
                    min="1"
                    max="50"
                    step="1"
                    className={`w-20 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : ""}`}
                  />
                  <div className="flex-1">
                    <Slider
                      value={leftMass}
                      onValueChange={(value) => {
                        setLeftMass(value)
                        setLeftMassInput(value[0].toString())
                      }}
                      max={50}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Control de posición izquierda */}
              <div className="space-y-3">
                <label className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Posición: {leftPosition[0]} m
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={leftPosInput}
                    onChange={(e) => handleLeftPosInputChange(e.target.value)}
                    min="0.5"
                    max="4"
                    step="0.1"
                    className={`w-20 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : ""}`}
                  />
                  <div className="flex-1">
                    <Slider
                      value={leftPosition}
                      onValueChange={(value) => {
                        setLeftPosition(value)
                        setLeftPosInput(value[0].toString())
                      }}
                      max={4}
                      min={0.5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Controles del lado derecho */}
            <div className="space-y-4">
              <h4 className={`font-medium ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>Lado Derecho</h4>

              {/* Control de masa derecha */}
              <div className="space-y-3">
                <label className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Masa: {rightMass[0]} kg
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={rightMassInput}
                    onChange={(e) => handleRightMassInputChange(e.target.value)}
                    min="1"
                    max="50"
                    step="1"
                    className={`w-20 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : ""}`}
                  />
                  <div className="flex-1">
                    <Slider
                      value={rightMass}
                      onValueChange={(value) => {
                        setRightMass(value)
                        setRightMassInput(value[0].toString())
                      }}
                      max={50}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Control de posición derecha */}
              <div className="space-y-3">
                <label className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Posición: {rightPosition[0]} m
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={rightPosInput}
                    onChange={(e) => handleRightPosInputChange(e.target.value)}
                    min="0.5"
                    max="4"
                    step="0.1"
                    className={`w-20 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : ""}`}
                  />
                  <div className="flex-1">
                    <Slider
                      value={rightPosition}
                      onValueChange={(value) => {
                        setRightPosition(value)
                        setRightPosInput(value[0].toString())
                      }}
                      max={4}
                      min={0.5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Opciones de visualización estilo PhET */}
            <div className="space-y-3 border-t pt-4">
              <h4 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Opciones de Visualización
              </h4>

              {/* Switch para vectores de fuerza */}
              <div className="flex items-center justify-between">
                <label className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Vectores de Fuerza
                </label>
                <Switch checked={showForces} onCheckedChange={setShowForces} />
              </div>

              {/* Switch para indicadores de torque */}
              <div className="flex items-center justify-between">
                <label className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Indicadores de Torque
                </label>
                <Switch checked={showTorques} onCheckedChange={setShowTorques} />
              </div>

              {/* Switch para líneas de referencia */}
              <div className="flex items-center justify-between">
                <label className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Líneas de Referencia
                </label>
                <Switch checked={showGrid} onCheckedChange={setShowGrid} />
              </div>
            </div>

            {/* Estado del sistema */}
            <div className="space-y-2">
              <h4 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>Estado del Sistema</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>Torque Izq:</span>
                  <Badge variant="destructive" className={isDarkMode ? "bg-red-900 text-red-100" : ""}>
                    {leftTorque.toFixed(1)} N⋅m
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>Torque Der:</span>
                  <Badge variant="secondary" className={isDarkMode ? "bg-blue-900 text-blue-100" : ""}>
                    {rightTorque.toFixed(1)} N⋅m
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>Balance:</span>
                  <Badge
                    variant={isBalanced ? "default" : "outline"}
                    className={
                      isBalanced
                        ? isDarkMode
                          ? "bg-green-900 text-green-100"
                          : "bg-green-600"
                        : isDarkMode
                          ? "border-slate-600 text-white"
                          : ""
                    }
                  >
                    {isBalanced ? "Equilibrio" : "Desequilibrio"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historial de experimentos */}
      {/* <-- EDITABLE: Fondo del historial */}
      <Card className={isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white"}>
        <CardHeader>
          <CardTitle className={`flex items-center justify-between ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Historial de Experimentos
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              className={isDarkMode ? "border-slate-600 text-white hover:bg-slate-700" : ""}
            >
              <Trash2 className="w-4 h-4" />
              Limpiar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {balanceHistory.length === 0 ? (
              <p className={`text-center py-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                No hay experimentos en el historial. Realiza un experimento para generar resultados.
              </p>
            ) : (
              // Mostrar historial en orden inverso (más reciente primero)
              balanceHistory
                .slice()
                .reverse()
                .map((result) => (
                  <div
                    key={result.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:opacity-80 ${
                      selectedHistoryItem === result.id
                        ? isDarkMode
                          ? "bg-blue-900/30 border-blue-600"
                          : "bg-blue-50 border-blue-300"
                        : isDarkMode
                          ? "bg-slate-700 border-slate-600 hover:bg-slate-600"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                    onClick={() => loadFromHistory(result)} // Cargar parámetros del historial
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Izq: {result.leftMass}kg @ {result.leftPosition}m | Der: {result.rightMass}kg @{" "}
                        {result.rightPosition}m
                      </div>
                      <Badge
                        variant={result.isBalanced ? "default" : "secondary"}
                        className={`text-xs ${
                          result.isBalanced
                            ? isDarkMode
                              ? "bg-green-900 text-green-100"
                              : "bg-green-600"
                            : isDarkMode
                              ? "bg-slate-600 text-slate-100"
                              : ""
                        }`}
                      >
                        {result.isBalanced ? "Equilibrio" : "Desequilibrio"}
                      </Badge>
                    </div>
                    <div className={`text-xs font-mono ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {result.formula}
                    </div>
                    <div className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                      {result.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sección de teoría */}
      <Card className={isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white"}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            <Scale className="w-5 h-5" />
            Principios de Equilibrio y Torque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Torque (Momento de Fuerza)
              </h4>
              <p className={`mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>τ = F × d</p>
              <ul className={`space-y-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                <li>• τ = Torque (N⋅m)</li>
                <li>• F = Fuerza aplicada (N)</li>
                <li>• d = Distancia al punto de apoyo (m)</li>
                <li>• El torque causa rotación</li>
              </ul>
            </div>
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Condiciones de Equilibrio
              </h4>
              <ul className={`space-y-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                <li>
                  • <strong>Equilibrio:</strong> Σ τ = 0
                </li>
                <li>• Torques en sentido horario = antihorario</li>
                <li>• Mayor distancia = menor fuerza necesaria</li>
                <li>• Principio de la palanca</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
