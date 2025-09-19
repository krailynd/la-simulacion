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
import { RotateCcw, Play, Pause, Target, Calculator, History, Trash2, Moon, Sun } from "lucide-react"

// Interfaz TypeScript para definir las propiedades del proyectil
interface Projectile {
  x: number // Posición horizontal en píxeles
  y: number // Posición vertical en píxeles
  vx: number // Velocidad horizontal en m/s
  vy: number // Velocidad vertical en m/s
  trail: { x: number; y: number }[] // Array de posiciones para dibujar la estela
  time: number // Tiempo transcurrido en segundos
}

// Interfaz para almacenar resultados de cálculos en el historial
interface CalculationResult {
  id: number // ID único del cálculo
  velocity: number // Velocidad inicial en m/s
  angle: number // Ángulo de lanzamiento en grados
  gravity: number // Aceleración gravitacional en m/s²
  mass: number // Masa del proyectil en kg
  diameter: number // Diámetro del proyectil en m
  dragCoeff: number // Coeficiente de resistencia
  altitude: number // Altitud en m
  range: number // Alcance calculado en metros
  maxHeight: number // Altura máxima en metros
  timeOfFlight: number // Tiempo de vuelo en segundos
  timestamp: Date // Momento del cálculo
  formula: string // Fórmula utilizada para el cálculo
}

// Componente principal de la simulación de movimiento de proyectiles estilo PhET
export function ProjectileMotionSimulation() {
  // Referencia al elemento canvas para dibujar la simulación
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Referencia para controlar la animación con requestAnimationFrame
  const animationRef = useRef<number>()

  // Estados para los parámetros de la simulación (usando arrays para compatibilidad con Slider)
  const [initialVelocity, setInitialVelocity] = useState([9]) // Velocidad inicial en m/s (como en la imagen PhET)
  const [launchAngle, setLaunchAngle] = useState([45]) // Ángulo de lanzamiento en grados
  const [gravity, setGravity] = useState([9.81]) // Gravedad en m/s²
  const [mass, setMass] = useState([3]) // Masa del proyectil en kg (como en la imagen PhET)
  const [diameter, setDiameter] = useState([0.1]) // Diámetro en m (como en la imagen PhET)
  const [dragCoeff, setDragCoeff] = useState([0.06]) // Coeficiente de resistencia (como en la imagen PhET)
  const [altitude, setAltitude] = useState([1600]) // Altitud en m (como en la imagen PhET)

  // Estados de control de la simulación
  const [isPlaying, setIsPlaying] = useState(false) // Estado de reproducción de la animación
  const [projectile, setProjectile] = useState<Projectile | null>(null) // Estado del proyectil
  const [showTrajectory, setShowTrajectory] = useState(true) // Mostrar/ocultar trayectoria teórica
  const [showVelocityVectors, setShowVelocityVectors] = useState(true) // Mostrar vectores de velocidad
  const [showForceVectors, setShowForceVectors] = useState(false) // Mostrar vectores de fuerza
  const [showComponents, setShowComponents] = useState(false) // Mostrar componentes
  const [isDarkMode, setIsDarkMode] = useState(false) // Modo oscuro

  // Estados para campos de entrada interactivos
  const [velocityInput, setVelocityInput] = useState("9") // Campo de texto para velocidad
  const [angleInput, setAngleInput] = useState("45") // Campo de texto para ángulo
  const [massInput, setMassInput] = useState("3") // Campo de texto para masa
  const [diameterInput, setDiameterInput] = useState("0.1") // Campo de texto para diámetro
  const [dragInput, setDragInput] = useState("0.06") // Campo de texto para coeficiente de resistencia
  const [altitudeInput, setAltitudeInput] = useState("1600") // Campo de texto para altitud

  // Estados para cálculos y historial
  const [targetRange, setTargetRange] = useState("") // Campo para calcular ángulo objetivo
  const [calculatedAngle, setCalculatedAngle] = useState(0) // Ángulo calculado para alcance objetivo
  const [showCalculations, setShowCalculations] = useState(false) // Mostrar/ocultar panel de cálculos
  const [calculationHistory, setCalculationHistory] = useState<CalculationResult[]>([]) // Historial de cálculos
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<number | null>(null) // Item seleccionado del historial

  // Cálculos físicos basados en los parámetros actuales
  const angleRad = (launchAngle[0] * Math.PI) / 180 // Conversión de grados a radianes
  const vx0 = initialVelocity[0] * Math.cos(angleRad) // Componente horizontal de velocidad inicial
  const vy0 = initialVelocity[0] * Math.sin(angleRad) // Componente vertical de velocidad inicial
  const timeOfFlight = (2 * vy0) / gravity[0] // Tiempo total de vuelo
  const maxHeight = (vy0 * vy0) / (2 * gravity[0]) // Altura máxima alcanzada
  const range = (initialVelocity[0] * initialVelocity[0] * Math.sin(2 * angleRad)) / gravity[0] // Alcance máximo

  // Constantes de escala para convertir metros a píxeles en el canvas (estilo PhET)
  const SCALE_X = 8 // píxeles por metro horizontalmente (más zoom como PhET)
  const SCALE_Y = 12 // píxeles por metro verticalmente (más zoom como PhET)
  const GROUND_Y = 280 // Posición Y del suelo en píxeles
  const LAUNCHER_X = 80 // Posición X del lanzador en píxeles

  // Colores del tema - puedes cambiar estos valores para personalizar la apariencia
  const colors = {
    // Colores del fondo (estilo PhET)
    skyTop: isDarkMode ? "#1e293b" : "#00bfff", // Azul cielo brillante como PhET
    skyBottom: isDarkMode ? "#334155" : "#87ceeb", // Azul más claro
    ground: isDarkMode ? "#166534" : "#32cd32", // Verde brillante como PhET
    groundDark: isDarkMode ? "#14532d" : "#228b22", // Verde más oscuro

    // Colores del cañón
    cannonMain: isDarkMode ? "#7f1d1d" : "#ff4500", // Rojo-naranja como PhET
    cannonDetail: isDarkMode ? "#991b1b" : "#ff6347", // Rojo más claro

    // Colores de trayectoria y proyectil
    trajectory: isDarkMode ? "#f59e0b" : "#ff1493", // Rosa brillante como PhET
    projectile: isDarkMode ? "#dc2626" : "#ff0000", // Rojo brillante
    trail: isDarkMode ? "239, 68, 68" : "255, 20, 147", // RGB para transparencia

    // Colores de vectores
    velocity: isDarkMode ? "#10b981" : "#00ff00", // Verde brillante para velocidad
    force: isDarkMode ? "#3b82f6" : "#0000ff", // Azul para fuerza

    // Colores de UI
    text: isDarkMode ? "#f1f5f9" : "#1e293b",
    textSecondary: isDarkMode ? "#94a3b8" : "#64748b",
    target: isDarkMode ? "#dc2626" : "#ff0000",
    grid: isDarkMode ? "#475569" : "#94a3b8",
  }

  // Función para manejar cambios en el campo de velocidad
  const handleVelocityInputChange = (value: string) => {
    setVelocityInput(value) // Actualizar el valor del campo de texto
    const numValue = Number.parseFloat(value) // Convertir a número
    // Validar que esté en el rango permitido
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 50) {
      setInitialVelocity([numValue]) // Actualizar el estado si es válido
    }
  }

  // Función para manejar cambios en el campo de ángulo
  const handleAngleInputChange = (value: string) => {
    setAngleInput(value)
    const numValue = Number.parseFloat(value)
    // Validar rango de 0 a 90 grados
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 90) {
      setLaunchAngle([numValue])
    }
  }

  // Función para manejar cambios en el campo de masa
  const handleMassInputChange = (value: string) => {
    setMassInput(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 10) {
      setMass([numValue])
    }
  }

  // Función para manejar cambios en el campo de diámetro
  const handleDiameterInputChange = (value: string) => {
    setDiameterInput(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0.01 && numValue <= 1) {
      setDiameter([numValue])
    }
  }

  // Función para manejar cambios en el coeficiente de resistencia
  const handleDragInputChange = (value: string) => {
    setDragInput(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 2) {
      setDragCoeff([numValue])
    }
  }

  // Función para manejar cambios en la altitud
  const handleAltitudeInputChange = (value: string) => {
    setAltitudeInput(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 5000) {
      setAltitude([numValue])
    }
  }

  // Función para calcular el ángulo necesario para alcanzar un rango específico
  const calculateAngleForRange = () => {
    if (!targetRange) return // Salir si no hay valor objetivo
    const targetR = Number.parseFloat(targetRange)
    const v2 = initialVelocity[0] * initialVelocity[0]
    // Fórmula: θ = arcsin(R*g/v²)/2
    const angleRad = Math.asin((targetR * gravity[0]) / v2) / 2
    const angleDeg = (angleRad * 180) / Math.PI

    // Aplicar el ángulo calculado si es válido
    if (!isNaN(angleDeg) && angleDeg >= 0 && angleDeg <= 90) {
      setCalculatedAngle(angleDeg)
      setLaunchAngle([angleDeg])
      setAngleInput(angleDeg.toFixed(1))
    }
  }

  // Función para agregar un resultado al historial de cálculos
  const addToHistory = useCallback(() => {
    const newResult: CalculationResult = {
      id: Date.now(), // ID único basado en timestamp
      velocity: initialVelocity[0],
      angle: launchAngle[0],
      gravity: gravity[0],
      mass: mass[0],
      diameter: diameter[0],
      dragCoeff: dragCoeff[0],
      altitude: altitude[0],
      range: range,
      maxHeight: maxHeight,
      timeOfFlight: timeOfFlight,
      timestamp: new Date(),
      // Fórmula matemática formateada para mostrar
      formula: `R = v²sin(2θ)/g = ${initialVelocity[0]}²sin(${(2 * launchAngle[0]).toFixed(0)}°)/${gravity[0]} = ${range.toFixed(1)}m`,
    }
    // Mantener solo los últimos 20 resultados
    setCalculationHistory((prev) => [...prev.slice(-19), newResult])
  }, [initialVelocity, launchAngle, gravity, mass, diameter, dragCoeff, altitude, range, maxHeight, timeOfFlight])

  // Función para cargar parámetros desde el historial con animación suave
  const loadFromHistory = (result: CalculationResult) => {
    setSelectedHistoryItem(result.id) // Marcar como seleccionado

    // Valores iniciales para la animación
    const startVel = initialVelocity[0]
    const startAngle = launchAngle[0]
    const startMass = mass[0]
    const startDiameter = diameter[0]
    const startDrag = dragCoeff[0]
    const startAltitude = altitude[0]

    let progress = 0 // Progreso de la animación (0 a 1)
    // Función de animación recursiva
    const animateToHistory = () => {
      progress += 0.05 // Incrementar progreso
      if (progress <= 1) {
        // Interpolación lineal entre valores inicial y final
        const currentVel = startVel + (result.velocity - startVel) * progress
        const currentAngle = startAngle + (result.angle - startAngle) * progress
        const currentMass = startMass + (result.mass - startMass) * progress
        const currentDiameter = startDiameter + (result.diameter - startDiameter) * progress
        const currentDrag = startDrag + (result.dragCoeff - startDrag) * progress
        const currentAltitude = startAltitude + (result.altitude - startAltitude) * progress

        // Actualizar todos los estados con los valores interpolados
        setInitialVelocity([currentVel])
        setLaunchAngle([currentAngle])
        setMass([currentMass])
        setDiameter([currentDiameter])
        setDragCoeff([currentDrag])
        setAltitude([currentAltitude])
        setVelocityInput(currentVel.toFixed(1))
        setAngleInput(currentAngle.toFixed(1))
        setMassInput(currentMass.toFixed(1))
        setDiameterInput(currentDiameter.toFixed(2))
        setDragInput(currentDrag.toFixed(2))
        setAltitudeInput(currentAltitude.toFixed(0))

        // Continuar la animación en el siguiente frame
        requestAnimationFrame(animateToHistory)
      } else {
        // Animación completada
        setSelectedHistoryItem(null)
      }
    }
    animateToHistory() // Iniciar la animación
  }

  // Efecto para manejar la animación del proyectil a 60fps
  useEffect(() => {
    if (isPlaying && projectile) {
      const animate = () => {
        setProjectile((prev) => {
          if (!prev) return null

          const dt = 1 / 60 // Timestep de 60fps (1/60 segundos)
          const newTime = prev.time + dt // Nuevo tiempo

          // Calcular nueva posición usando ecuaciones cinemáticas
          const newX = LAUNCHER_X + vx0 * newTime * SCALE_X // x = x₀ + vx*t
          const newY = GROUND_Y - (vy0 * newTime - 0.5 * gravity[0] * newTime * newTime) * SCALE_Y // y = y₀ + vy*t - ½gt²

          // Verificar si el proyectil toca el suelo
          if (newY >= GROUND_Y) {
            setIsPlaying(false) // Detener animación
            addToHistory() // Agregar al historial
            // Posicionar exactamente en el punto de impacto
            return {
              ...prev,
              x: LAUNCHER_X + range * SCALE_X,
              y: GROUND_Y,
              time: timeOfFlight,
            }
          }

          // Crear nuevo estado del proyectil
          const newProjectile = {
            x: newX,
            y: newY,
            vx: vx0, // Velocidad horizontal constante
            vy: vy0 - gravity[0] * newTime, // Velocidad vertical con gravedad
            time: newTime,
            trail: [...prev.trail, { x: newX, y: newY }].slice(-100), // Mantener últimos 100 puntos de la estela
          }

          return newProjectile
        })

        // Programar el siguiente frame de animación
        animationRef.current = requestAnimationFrame(animate)
      }

      // Iniciar la animación
      animationRef.current = requestAnimationFrame(animate)
    }

    // Cleanup: cancelar animación al desmontar o cambiar dependencias
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, projectile, vx0, vy0, gravity, range, timeOfFlight, addToHistory])

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

    // Dibujar fondo del cielo con gradiente brillante como PhET
    const skyGradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y)
    skyGradient.addColorStop(0, colors.skyTop) // Azul cielo brillante
    skyGradient.addColorStop(1, colors.skyBottom) // Azul más claro
    ctx.fillStyle = skyGradient
    ctx.fillRect(0, 0, canvas.width, GROUND_Y)

    // Dibujar montañas de fondo estilo PhET
    ctx.fillStyle = isDarkMode ? "#8b4513" : "#daa520"
    ctx.beginPath()
    ctx.moveTo(400, GROUND_Y)
    ctx.lineTo(450, GROUND_Y - 80)
    ctx.lineTo(500, GROUND_Y - 60)
    ctx.lineTo(550, GROUND_Y - 100)
    ctx.lineTo(600, GROUND_Y - 40)
    ctx.lineTo(600, GROUND_Y)
    ctx.closePath()
    ctx.fill()

    // Segunda cadena montañosa
    ctx.fillStyle = isDarkMode ? "#a0522d" : "#cd853f"
    ctx.beginPath()
    ctx.moveTo(350, GROUND_Y)
    ctx.lineTo(400, GROUND_Y - 50)
    ctx.lineTo(480, GROUND_Y - 70)
    ctx.lineTo(520, GROUND_Y - 30)
    ctx.lineTo(600, GROUND_Y - 20)
    ctx.lineTo(600, GROUND_Y)
    ctx.closePath()
    ctx.fill()

    // Dibujar suelo con textura de gradiente verde brillante
    const groundGradient = ctx.createLinearGradient(0, GROUND_Y, 0, canvas.height)
    groundGradient.addColorStop(0, colors.ground) // Verde brillante como PhET
    groundGradient.addColorStop(1, colors.groundDark) // Verde más oscuro
    ctx.fillStyle = groundGradient
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y)

    // Dibujar líneas de referencia de distancia (estilo PhET)
    ctx.strokeStyle = colors.grid
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])
    for (let i = 0; i <= 50; i += 5) {
      const x = LAUNCHER_X + i * SCALE_X
      if (x < canvas.width) {
        ctx.beginPath()
        ctx.moveTo(x, GROUND_Y - 5)
        ctx.lineTo(x, GROUND_Y + 5)
        ctx.stroke()
      }
    }
    ctx.setLineDash([])

    // Dibujar lanzador/cañón estilo PhET con ángulo correcto
    ctx.save() // Guardar estado del contexto
    ctx.translate(LAUNCHER_X, GROUND_Y) // Mover origen al punto de lanzamiento
    ctx.rotate(-angleRad) // Rotar según el ángulo de lanzamiento

    // Dibujar cuerpo del cañón con colores brillantes
    ctx.fillStyle = colors.cannonMain // Rojo-naranja brillante
    ctx.fillRect(0, -12, 60, 24) // Rectángulo principal del cañón más grande
    ctx.fillStyle = colors.cannonDetail // Rojo más claro para detalles
    ctx.fillRect(0, -8, 55, 16) // Rectángulo interior

    // Detalles del cañón
    ctx.fillStyle = isDarkMode ? "#4b5563" : "#2d3748"
    ctx.fillRect(50, -6, 8, 12) // Boca del cañón
    ctx.restore() // Restaurar estado del contexto

    // Dibujar base del cañón
    ctx.fillStyle = isDarkMode ? "#374151" : "#4a5568"
    ctx.fillRect(LAUNCHER_X - 15, GROUND_Y, 30, 20)

    // Dibujar trayectoria teórica si está habilitada
    if (showTrajectory && !isPlaying) {
      // Color de la trayectoria teórica estilo PhET
      ctx.strokeStyle = colors.trajectory // Rosa brillante como PhET
      ctx.lineWidth = 4
      ctx.setLineDash([10, 5]) // Línea punteada más visible
      ctx.beginPath()

      // Dibujar la curva parabólica punto por punto
      for (let t = 0; t <= timeOfFlight; t += 0.02) {
        const x = LAUNCHER_X + vx0 * t * SCALE_X
        const y = GROUND_Y - (vy0 * t - 0.5 * gravity[0] * t * t) * SCALE_Y

        if (t === 0) {
          ctx.moveTo(x, y) // Primer punto
        } else {
          ctx.lineTo(x, y) // Líneas subsecuentes
        }
      }
      ctx.stroke()
      ctx.setLineDash([]) // Resetear línea punteada
    }

    // Dibujar objetivo/diana en el punto de impacto calculado (estilo PhET)
    const targetX = LAUNCHER_X + range * SCALE_X
    if (targetX < canvas.width - 50) {
      // Solo dibujar si cabe en el canvas
      // Poste del objetivo
      ctx.fillStyle = colors.target // Rojo brillante
      ctx.fillRect(targetX - 3, GROUND_Y - 50, 6, 50)

      // Círculos concéntricos del objetivo más grandes
      ctx.strokeStyle = colors.target
      ctx.lineWidth = 4
      // Círculo exterior
      ctx.beginPath()
      ctx.arc(targetX, GROUND_Y - 35, 25, 0, Math.PI * 2)
      ctx.stroke()
      // Círculo medio
      ctx.beginPath()
      ctx.arc(targetX, GROUND_Y - 35, 15, 0, Math.PI * 2)
      ctx.stroke()
      // Centro del objetivo (relleno)
      ctx.beginPath()
      ctx.arc(targetX, GROUND_Y - 35, 6, 0, Math.PI * 2)
      ctx.fillStyle = colors.target
      ctx.fill()

      // Mostrar distancia al objetivo
      ctx.fillStyle = colors.text
      ctx.font = "bold 14px sans-serif"
      ctx.fillText(`${range.toFixed(1)} m`, targetX - 20, GROUND_Y + 25)
    }

    // Dibujar proyectil y su estela si existe
    if (projectile) {
      // Dibujar estela con efecto de desvanecimiento más visible
      if (projectile.trail.length > 1) {
        for (let i = 1; i < projectile.trail.length; i++) {
          const alpha = (i / projectile.trail.length) * 0.8 // Transparencia gradual más visible
          ctx.strokeStyle = `rgba(${colors.trail}, ${alpha})` // Color con transparencia
          ctx.lineWidth = 4
          ctx.beginPath()
          ctx.moveTo(projectile.trail[i - 1].x, projectile.trail[i - 1].y)
          ctx.lineTo(projectile.trail[i].x, projectile.trail[i].y)
          ctx.stroke()
        }
      }

      // Dibujar proyectil con efecto de brillo más prominente
      ctx.shadowColor = colors.projectile // Color de la sombra/brillo
      ctx.shadowBlur = 15 // Intensidad del brillo mayor
      ctx.fillStyle = colors.projectile // Color del proyectil brillante
      ctx.beginPath()
      ctx.arc(projectile.x, projectile.y, 10, 0, Math.PI * 2) // Proyectil más grande
      ctx.fill()
      ctx.shadowBlur = 0 // Resetear efecto de brillo

      // Dibujar vectores si están habilitados
      if (showVelocityVectors) {
        // Color del vector velocidad estilo PhET
        const velocityScale = 4 // Escala para visualizar el vector más grande
        const currentVx = projectile.vx
        const currentVy = projectile.vy
        ctx.strokeStyle = colors.velocity // Verde brillante
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(projectile.x, projectile.y) // Desde el proyectil
        ctx.lineTo(projectile.x + currentVx * velocityScale, projectile.y - currentVy * velocityScale) // Hasta el extremo del vector
        ctx.stroke()

        // Dibujar punta de flecha del vector velocidad más grande
        const vx_scaled = currentVx * velocityScale
        const vy_scaled = currentVy * velocityScale
        const arrowLength = 12
        const angle = Math.atan2(-vy_scaled, vx_scaled) // Ángulo del vector

        ctx.beginPath()
        // Primera línea de la punta de flecha
        ctx.moveTo(projectile.x + vx_scaled, projectile.y - vy_scaled)
        ctx.lineTo(
          projectile.x + vx_scaled - arrowLength * Math.cos(angle - Math.PI / 6),
          projectile.y - vy_scaled + arrowLength * Math.sin(angle - Math.PI / 6),
        )
        // Segunda línea de la punta de flecha
        ctx.moveTo(projectile.x + vx_scaled, projectile.y - vy_scaled)
        ctx.lineTo(
          projectile.x + vx_scaled - arrowLength * Math.cos(angle + Math.PI / 6),
          projectile.y - vy_scaled + arrowLength * Math.sin(angle + Math.PI / 6),
        )
        ctx.stroke()
      }

      // Mostrar componentes de velocidad si está habilitado
      if (showComponents && showVelocityVectors) {
        const velocityScale = 4
        const currentVx = projectile.vx
        const currentVy = projectile.vy

        // Componente horizontal (Vx)
        ctx.strokeStyle = isDarkMode ? "#fbbf24" : "#f59e0b" // Amarillo
        ctx.lineWidth = 3
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(projectile.x, projectile.y)
        ctx.lineTo(projectile.x + currentVx * velocityScale, projectile.y)
        ctx.stroke()

        // Componente vertical (Vy)
        ctx.strokeStyle = isDarkMode ? "#06b6d4" : "#0891b2" // Cian
        ctx.beginPath()
        ctx.moveTo(projectile.x, projectile.y)
        ctx.lineTo(projectile.x, projectile.y - currentVy * velocityScale)
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    // Mostrar información de cálculos en tiempo real con estilo PhET
    ctx.fillStyle = colors.text // Color de texto adaptable al tema
    ctx.font = "bold 16px sans-serif"
    // Mostrar resultados teóricos como en la imagen PhET
    ctx.fillText(`Alcance teórico: ${range.toFixed(1)} m`, 20, 30)
    ctx.fillText(`Altura máxima: ${maxHeight.toFixed(1)} m`, 20, 55)
    ctx.fillText(`Tiempo de vuelo: ${timeOfFlight.toFixed(2)} s`, 20, 80)

    // Mostrar información del proyectil en movimiento
    if (projectile) {
      const currentRange = (projectile.x - LAUNCHER_X) / SCALE_X // Posición horizontal actual
      const currentHeight = (GROUND_Y - projectile.y) / SCALE_Y // Altura actual
      const currentSpeed = Math.sqrt(projectile.vx * projectile.vx + projectile.vy * projectile.vy) // Velocidad actual

      ctx.font = "14px sans-serif"
      ctx.fillText(`Posición: (${currentRange.toFixed(1)}, ${currentHeight.toFixed(1)}) m`, 20, 110)
      ctx.fillText(`Velocidad: ${currentSpeed.toFixed(1)} m/s`, 20, 130)
      ctx.fillText(`Tiempo: ${projectile.time.toFixed(2)} s`, 20, 150)
    }

    // Dibujar marcas de escala en el eje horizontal más visibles
    ctx.strokeStyle = colors.grid // Color de grilla adaptable
    ctx.lineWidth = 2
    ctx.font = "12px sans-serif"
    ctx.fillStyle = colors.textSecondary // Color de texto secundario

    // Marcas cada 5 metros más prominentes
    for (let i = 0; i <= Math.ceil(range + 10); i += 5) {
      const x = LAUNCHER_X + i * SCALE_X
      if (x < canvas.width - 30) {
        // Solo dibujar si cabe
        ctx.beginPath()
        ctx.moveTo(x, GROUND_Y) // Línea vertical
        ctx.lineTo(x, GROUND_Y + 8)
        ctx.stroke()
        ctx.fillText(`${i}m`, x - 8, GROUND_Y + 22) // Etiqueta de distancia
      }
    }
  }, [
    projectile,
    showTrajectory,
    showVelocityVectors,
    showForceVectors,
    showComponents,
    angleRad,
    vx0,
    vy0,
    timeOfFlight,
    maxHeight,
    range,
    isPlaying,
    gravity,
  ])

  // Función para iniciar el lanzamiento
  const launch = () => {
    // Crear nuevo proyectil en la posición inicial
    setProjectile({
      x: LAUNCHER_X,
      y: GROUND_Y,
      vx: vx0,
      vy: vy0,
      time: 0,
      trail: [{ x: LAUNCHER_X, y: GROUND_Y }], // Iniciar estela
    })
    setIsPlaying(true) // Iniciar animación
  }

  // Función para resetear todos los parámetros a valores por defecto
  const reset = () => {
    setInitialVelocity([9])
    setLaunchAngle([45])
    setMass([3])
    setDiameter([0.1])
    setDragCoeff([0.06])
    setAltitude([1600])
    setVelocityInput("9")
    setAngleInput("45")
    setMassInput("3")
    setDiameterInput("0.1")
    setDragInput("0.06")
    setAltitudeInput("1600")
    setIsPlaying(false)
    setProjectile(null)
    setTargetRange("")
    setCalculatedAngle(0)
  }

  // Función para limpiar el historial de cálculos
  const clearHistory = () => {
    setCalculationHistory([])
  }

  // Renderizado del componente con estilo PhET
  return (
    <div className={`space-y-6 transition-colors duration-300 ${isDarkMode ? "dark" : ""}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas de simulación estilo PhET */}
        <Card className={`lg:col-span-2 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white"}`}>
          <CardHeader>
            <CardTitle className={`flex items-center justify-between ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Movimiento de un Proyectil
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
                {/* Botón para mostrar/ocultar trayectoria teórica */}
                <Button
                  variant={showTrajectory ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowTrajectory(!showTrajectory)}
                  className={isDarkMode && !showTrajectory ? "border-slate-600 text-white hover:bg-slate-700" : ""}
                >
                  <Target className="w-4 h-4" />
                </Button>
                {/* Botón de lanzamiento */}
                <Button variant="default" size="sm" onClick={launch} disabled={isPlaying}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  Lanzar
                </Button>
                {/* Botón para mostrar/ocultar cálculos */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCalculations(!showCalculations)}
                  className={isDarkMode ? "border-slate-600 text-white hover:bg-slate-700" : ""}
                >
                  <Calculator className="w-4 h-4" />
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
            {/* Imagen de referencia de resultados PhET */}
            <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? "bg-slate-700" : "bg-gray-100"}`}>
              <img
                src="#"
                alt="Simulación PhET de movimiento de proyectiles"
                className="w-full h-auto mx-auto rounded"
              />
              <p className={`text-xs text-center mt-2 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
                Referencia: Simulación PhET de Movimiento de Proyectiles
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Panel de controles interactivos estilo PhET */}
        <Card className={isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white"}>
          <CardHeader>
            <CardTitle className={isDarkMode ? "text-white" : "text-gray-900"}>Controles Estilo PhET</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Control de velocidad inicial */}
            <div className="space-y-3">
              <label className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Velocidad Inicial: {initialVelocity[0]} m/s
              </label>
              <div className="flex gap-2">
                {/* Campo de entrada numérica */}
                <Input
                  type="number"
                  value={velocityInput}
                  onChange={(e) => handleVelocityInputChange(e.target.value)}
                  min="1"
                  max="50"
                  step="0.1"
                  className={`w-20 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : ""}`}
                />
                {/* Deslizador */}
                <div className="flex-1">
                  <Slider
                    value={initialVelocity}
                    onValueChange={(value) => {
                      setInitialVelocity(value)
                      setVelocityInput(value[0].toString())
                    }}
                    max={50}
                    min={1}
                    step={0.1}
                    className="w-full"
                    disabled={isPlaying} // Deshabilitar durante animación
                  />
                </div>
              </div>
            </div>

            {/* Control de ángulo de lanzamiento */}
            <div className="space-y-3">
              <label className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Ángulo: {launchAngle[0]}°
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={angleInput}
                  onChange={(e) => handleAngleInputChange(e.target.value)}
                  min="0"
                  max="90"
                  step="0.1"
                  className={`w-20 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : ""}`}
                />
                <div className="flex-1">
                  <Slider
                    value={launchAngle}
                    onValueChange={(value) => {
                      setLaunchAngle(value)
                      setAngleInput(value[0].toString())
                    }}
                    max={90}
                    min={0}
                    step={1}
                    className="w-full"
                    disabled={isPlaying}
                  />
                </div>
              </div>
            </div>

            {/* Control de masa (como en PhET) */}
            <div className="space-y-3">
              <label className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Masa: {mass[0]} kg
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={massInput}
                  onChange={(e) => handleMassInputChange(e.target.value)}
                  min="0.1"
                  max="10"
                  step="0.1"
                  className={`w-20 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : ""}`}
                />
                <div className="flex-1">
                  <Slider
                    value={mass}
                    onValueChange={(value) => {
                      setMass(value)
                      setMassInput(value[0].toString())
                    }}
                    max={10}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                    disabled={isPlaying}
                  />
                </div>
              </div>
            </div>

            {/* Control de diámetro (como en PhET) */}
            <div className="space-y-3">
              <label className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Diámetro: {diameter[0]} m
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={diameterInput}
                  onChange={(e) => handleDiameterInputChange(e.target.value)}
                  min="0.01"
                  max="1"
                  step="0.01"
                  className={`w-20 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : ""}`}
                />
                <div className="flex-1">
                  <Slider
                    value={diameter}
                    onValueChange={(value) => {
                      setDiameter(value)
                      setDiameterInput(value[0].toFixed(2))
                    }}
                    max={1}
                    min={0.01}
                    step={0.01}
                    className="w-full"
                    disabled={isPlaying}
                  />
                </div>
              </div>
            </div>

            {/* Opciones de visualización estilo PhET */}
            <div className="space-y-3 border-t pt-4">
              <h4 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Opciones de Visualización
              </h4>

              {/* Switch para vectores de velocidad */}
              <div className="flex items-center justify-between">
                <label className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Vectores de Velocidad
                </label>
                <Switch checked={showVelocityVectors} onCheckedChange={setShowVelocityVectors} />
              </div>

              {/* Switch para componentes */}
              <div className="flex items-center justify-between">
                <label className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Componentes</label>
                <Switch checked={showComponents} onCheckedChange={setShowComponents} />
              </div>

              {/* Switch para vectores de fuerza */}
              <div className="flex items-center justify-between">
                <label className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Vectores de Fuerza
                </label>
                <Switch checked={showForceVectors} onCheckedChange={setShowForceVectors} />
              </div>
            </div>

            {/* Información de resultados */}
            <div className="space-y-2">
              <h4 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>Resultados</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>Alcance:</span>
                  <Badge variant="outline" className={isDarkMode ? "border-slate-600 text-white" : ""}>
                    {range.toFixed(1)} m
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>Altura Máx:</span>
                  <Badge variant="outline" className={isDarkMode ? "border-slate-600 text-white" : ""}>
                    {maxHeight.toFixed(1)} m
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>Tiempo:</span>
                  <Badge variant="outline" className={isDarkMode ? "border-slate-600 text-white" : ""}>
                    {timeOfFlight.toFixed(1)} s
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historial de lanzamientos */}
      <Card className={isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white"}>
        <CardHeader>
          <CardTitle className={`flex items-center justify-between ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Historial de Lanzamientos
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
            {calculationHistory.length === 0 ? (
              <p className={`text-center py-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                No hay lanzamientos en el historial. Realiza un lanzamiento para generar resultados.
              </p>
            ) : (
              // Mostrar historial en orden inverso (más reciente primero)
              calculationHistory
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
                        v₀ = {result.velocity}m/s, θ = {result.angle.toFixed(1)}°, m = {result.mass}kg
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {result.range.toFixed(1)} m
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
    </div>
  )
}
