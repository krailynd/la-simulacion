"use client"

// <-- CHANGE: Nueva página de juego de física creada
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Timer, Target, Trophy, BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Problemas de física para el juego
const physicsProblems = [
  {
    id: 1,
    question: "Un proyectil se lanza con velocidad inicial de 20 m/s a 45°. ¿Cuál es el alcance máximo? (g = 10 m/s²)",
    answer: 40,
    unit: "m",
    formula: "R = v₀²sin(2θ)/g",
    procedure: [
      "1. Identificar datos: v₀ = 20 m/s, θ = 45°, g = 10 m/s²",
      "2. Aplicar fórmula: R = v₀²sin(2θ)/g",
      "3. Sustituir: R = (20)²sin(2×45°)/10",
      "4. Calcular: R = 400×sin(90°)/10 = 400×1/10 = 40 m",
    ],
  },
  {
    id: 2,
    question: "Un objeto se lanza verticalmente hacia arriba con 15 m/s. ¿Cuál es la altura máxima? (g = 10 m/s²)",
    answer: 11.25,
    unit: "m",
    formula: "h = v₀²/(2g)",
    procedure: [
      "1. Identificar datos: v₀ = 15 m/s, g = 10 m/s²",
      "2. Aplicar fórmula: h = v₀²/(2g)",
      "3. Sustituir: h = (15)²/(2×10)",
      "4. Calcular: h = 225/20 = 11.25 m",
    ],
  },
  {
    id: 3,
    question: "Un proyectil alcanza una altura máxima de 20 m. ¿Cuál fue su velocidad inicial vertical? (g = 10 m/s²)",
    answer: 20,
    unit: "m/s",
    formula: "v₀ = √(2gh)",
    procedure: [
      "1. Identificar datos: h = 20 m, g = 10 m/s²",
      "2. Aplicar fórmula: v₀ = √(2gh)",
      "3. Sustituir: v₀ = √(2×10×20)",
      "4. Calcular: v₀ = √400 = 20 m/s",
    ],
  },
]

export default function PhysicsGame() {
  // Estados del juego
  const [currentProblem, setCurrentProblem] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [timeLeft, setTimeLeft] = useState(60) // 60 segundos por problema
  const [score, setScore] = useState(0)
  const [gameState, setGameState] = useState<"playing" | "correct" | "incorrect" | "finished">("playing")
  const [showSolution, setShowSolution] = useState(false)
  const [gameHistory, setGameHistory] = useState<
    Array<{ problem: string; userAnswer: string; correctAnswer: number; isCorrect: boolean; timeUsed: number }>
  >([])

  // Referencias para animaciones
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  // Timer del juego
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameState === "playing") {
      handleAnswer() // Tiempo agotado
    }
  }, [timeLeft, gameState])

  // Animación del proyectil
  useEffect(() => {
    if (gameState === "correct" || gameState === "incorrect") {
      animateProjectile()
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameState])

  // Función para animar el proyectil
  const animateProjectile = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 600
    canvas.height = 300

    let t = 0
    const v0 = 25 // velocidad inicial
    const angle = Math.PI / 4 // 45 grados
    const g = 9.8

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // <-- EDITABLE: Colores del fondo de la animación
      // Fondo espacial
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "#1a1a2e")
      gradient.addColorStop(1, "#16213e")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Suelo
      ctx.fillStyle = "#2d5a27"
      ctx.fillRect(0, canvas.height - 50, canvas.width, 50)

      // Cañón
      ctx.fillStyle = gameState === "correct" ? "#10b981" : "#ef4444"
      ctx.fillRect(20, canvas.height - 80, 40, 30)

      // Objetivo
      ctx.fillStyle = "#dc2626"
      ctx.beginPath()
      ctx.arc(550, canvas.height - 70, 15, 0, 2 * Math.PI)
      ctx.fill()

      // Proyectil
      const x = 60 + v0 * Math.cos(angle) * t * 8
      const y = canvas.height - 65 - (v0 * Math.sin(angle) * t * 8 - 0.5 * g * t * t * 8)

      if (y <= canvas.height - 50 && x <= canvas.width) {
        ctx.fillStyle = gameState === "correct" ? "#fbbf24" : "#f87171"
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, 2 * Math.PI)
        ctx.fill()

        // Estela del proyectil
        ctx.strokeStyle = gameState === "correct" ? "#fbbf24" : "#f87171"
        ctx.lineWidth = 2
        ctx.beginPath()
        for (let i = 0; i < t; i += 0.1) {
          const trailX = 60 + v0 * Math.cos(angle) * i * 8
          const trailY = canvas.height - 65 - (v0 * Math.sin(angle) * i * 8 - 0.5 * g * i * i * 8)
          if (i === 0) ctx.moveTo(trailX, trailY)
          else ctx.lineTo(trailX, trailY)
        }
        ctx.stroke()

        t += 0.02
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Mostrar mensaje de resultado
        ctx.fillStyle = gameState === "correct" ? "#10b981" : "#ef4444"
        ctx.font = "24px Arial"
        ctx.textAlign = "center"
        ctx.fillText(gameState === "correct" ? "¡CORRECTO!" : "¡INCORRECTO!", canvas.width / 2, canvas.height / 2)
      }
    }

    animate()
  }

  // Manejar respuesta del usuario
  const handleAnswer = () => {
    const problem = physicsProblems[currentProblem]
    const userNum = Number.parseFloat(userAnswer)
    const isCorrect = Math.abs(userNum - problem.answer) < 0.1 // Tolerancia de 0.1
    const timeUsed = 60 - timeLeft

    // Agregar al historial
    setGameHistory((prev) => [
      ...prev,
      {
        problem: problem.question,
        userAnswer: userAnswer,
        correctAnswer: problem.answer,
        isCorrect,
        timeUsed,
      },
    ])

    if (isCorrect) {
      setScore(score + Math.max(10, 50 - timeUsed)) // Más puntos por responder rápido
      setGameState("correct")
    } else {
      setGameState("incorrect")
      setShowSolution(true)
    }

    // Avanzar al siguiente problema después de 3 segundos
    setTimeout(() => {
      if (currentProblem < physicsProblems.length - 1) {
        setCurrentProblem(currentProblem + 1)
        setUserAnswer("")
        setTimeLeft(60)
        setGameState("playing")
        setShowSolution(false)
      } else {
        setGameState("finished")
      }
    }, 3000)
  }

  // Reiniciar juego
  const resetGame = () => {
    setCurrentProblem(0)
    setUserAnswer("")
    setTimeLeft(60)
    setScore(0)
    setGameState("playing")
    setShowSolution(false)
    setGameHistory([])
  }

  const problem = physicsProblems[currentProblem]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* <-- EDITABLE: Fondo espacial difuminado */}
      <div
        className="fixed inset-0 z-0 opacity-30 blur-[1px]"
        style={{
          backgroundImage: "url('https://i.pinimg.com/originals/9c/40/8a/9c408a7a291d363c43c8f2cd5f1c5ddf.gif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="fixed inset-0 bg-black/85 z-10" />

      <div className="relative z-20 min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" className="bg-black/40 border-white/20 text-white hover:bg-black/60">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">Juego de Física</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-lg px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              {score} puntos
            </Badge>
          </div>
        </div>

        {gameState === "finished" ? (
          /* Pantalla de resultados finales */
          <div className="max-w-4xl mx-auto">
            <Card className="bg-black/40 border-white/20 backdrop-blur-md">
              <CardHeader className="text-center">
                <CardTitle className="text-4xl text-white mb-4">¡Juego Completado!</CardTitle>
                <div className="text-6xl text-yellow-400 mb-4">
                  <Trophy className="w-16 h-16 mx-auto" />
                </div>
                <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-2xl px-6 py-3">
                  Puntuación Final: {score}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Historial de Respuestas</h3>
                  {gameHistory.map((entry, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${entry.isCorrect ? "bg-green-900/20 border-green-500/30" : "bg-red-900/20 border-red-500/30"}`}
                    >
                      <p className="text-white font-semibold mb-2">Problema {index + 1}</p>
                      <p className="text-gray-300 mb-2">{entry.problem}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">
                          Tu respuesta: {entry.userAnswer} | Correcta: {entry.correctAnswer}
                        </span>
                        <Badge className={entry.isCorrect ? "bg-green-600" : "bg-red-600"}>
                          {entry.isCorrect ? "Correcto" : "Incorrecto"} ({entry.timeUsed}s)
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={resetGame}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
                  >
                    Jugar de Nuevo
                  </Button>
                  <Link href="/">
                    <Button
                      variant="outline"
                      className="bg-black/40 border-white/20 text-white hover:bg-black/60 px-8 py-3"
                    >
                      Volver al Laboratorio
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Pantalla de juego */
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Panel de problema */}
            <Card className="bg-black/40 border-white/20 backdrop-blur-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-white">
                    Problema {currentProblem + 1} de {physicsProblems.length}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-orange-400" />
                    <span className="text-xl font-bold text-orange-400">{timeLeft}s</span>
                  </div>
                </div>
                <Progress value={(timeLeft / 60) * 100} className="w-full" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <p className="text-lg text-white leading-relaxed">{problem.question}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Tu respuesta..."
                      className="bg-black/40 border-white/20 text-white text-lg"
                      disabled={gameState !== "playing"}
                    />
                    <span className="flex items-center text-white font-semibold px-3">{problem.unit}</span>
                  </div>

                  <Button
                    onClick={handleAnswer}
                    disabled={!userAnswer || gameState !== "playing"}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg py-3"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    Disparar Respuesta
                  </Button>
                </div>

                {showSolution && (
                  <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg space-y-3">
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Solución:
                    </h4>
                    <p className="text-yellow-300 font-mono text-lg">{problem.formula}</p>
                    <div className="space-y-1">
                      {problem.procedure.map((step, index) => (
                        <p key={index} className="text-gray-300">
                          {step}
                        </p>
                      ))}
                    </div>
                    <p className="text-green-400 font-bold text-lg">
                      Respuesta correcta: {problem.answer} {problem.unit}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Panel de animación */}
            <Card className="bg-black/40 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Simulación del Proyectil</CardTitle>
                <CardDescription className="text-gray-300">
                  {gameState === "playing" && "Ingresa tu respuesta y observa el resultado"}
                  {gameState === "correct" && "¡Excelente! El proyectil alcanzó el objetivo"}
                  {gameState === "incorrect" && "El proyectil falló. Revisa la solución"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <canvas
                  ref={canvasRef}
                  className="w-full border border-white/20 rounded-lg bg-black/20"
                  style={{ maxHeight: "300px" }}
                />

                {gameState === "playing" && (
                  <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <p className="text-center text-blue-300">El proyectil se animará cuando ingreses tu respuesta</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
