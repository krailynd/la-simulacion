"use client"

// Importaciones necesarias para React y componentes UI
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// Importación de las simulaciones de física
import { BalancingActSimulation } from "@/components/simulations/balancing-act"
import { ProjectileMotionSimulation } from "@/components/simulations/projectile-motion"
// Iconos de Lucide React para la interfaz
import { Scale, Target, Calculator, BookOpen, Zap, Gamepad2 } from "lucide-react"
import Link from "next/link"

// Configuración de las simulaciones disponibles con tema espacial
const simulations = [
  {
    id: "balancing-act", // ID único para identificar la simulación
    title: "Acto de Equilibrio", // Título mostrado al usuario
    description: "Explora las fuerzas gravitacionales y el equilibrio en el cosmos.",
    icon: Scale, // Icono de balanza
    component: BalancingActSimulation, // Componente React de la simulación
    color: "from-purple-600 to-indigo-700", // <-- EDITABLE: Gradiente espacial
    glowColor: "shadow-purple-500/30", // <-- EDITABLE: Color del brillo
    preview: "/physics-balance-simulation-with-scales-and-weights.jpg", // <-- CHANGE: Imagen de previsualización
  },
  {
    id: "projectile-motion", // ID único para movimiento de proyectiles
    title: "Movimiento de Proyectiles", // Título de la simulación
    description: "Simula trayectorias de objetos en campos gravitacionales complejos.",
    icon: Target, // Icono de objetivo
    component: ProjectileMotionSimulation, // Componente de la simulación
    color: "from-orange-600 to-red-700", // <-- EDITABLE: Gradiente espacial
    glowColor: "shadow-orange-500/30", // <-- EDITABLE: Color del brillo
    preview: "/projectile-motion-physics-simulation-with-cannon-a.jpg", // <-- CHANGE: Imagen de previsualización
  },
]

// <-- CHANGE: Nuevas secciones educativas agregadas
const educationalSections = [
  {
    id: "physics-game",
    title: "Juego de Física",
    description: "Resuelve problemas de física contra el tiempo y ve tus respuestas cobrar vida.",
    icon: Gamepad2,
    color: "from-green-600 to-emerald-700",
    glowColor: "shadow-green-500/30",
    preview: "/physics-game-interface-with-timer-and-projectile-p.jpg",
    href: "/physics-game",
  },
  {
    id: "dimensional-analysis",
    title: "Análisis Dimensional",
    description: "Domina las ecuaciones dimensionales y la consistencia de unidades.",
    icon: BookOpen,
    color: "from-blue-600 to-cyan-700",
    glowColor: "shadow-blue-500/30",
    preview: "/dimensional-analysis-physics-formulas-and-units-co.jpg",
    href: "/dimensional-analysis",
  },
  {
    id: "statics",
    title: "Estática",
    description: "Analiza fuerzas en equilibrio y estructuras estables.",
    icon: Zap,
    color: "from-yellow-600 to-orange-700",
    glowColor: "shadow-yellow-500/30",
    preview: "/statics-physics-forces-equilibrium-structures.jpg",
    href: "/statics",
  },
  {
    id: "calculator",
    title: "Calculadora Cuántica",
    description: "Calculadora científica avanzada con capacidades de análisis dimensional.",
    icon: Calculator,
    color: "from-cyan-600 to-blue-700",
    glowColor: "shadow-cyan-500/30",
    preview: "/scientific-calculator-interface-with-physics-formu.jpg",
    href: "/calculator",
  },
]

// Componente principal de la aplicación de simulaciones de física con tema Interstellar
export default function PhysicsSimulationsHome() {
  // Estado para controlar qué simulación está activa (null = página principal)
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null)
  // Estado para la animación de carga inicial
  const [isLoading, setIsLoading] = useState(true)
  // Estado para controlar las animaciones de entrada
  const [showContent, setShowContent] = useState(false)

  // Efecto para la animación de carga inicial tipo agujero negro
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setTimeout(() => setShowContent(true), 300)
    }, 2500) // <-- EDITABLE: Duración de la animación de carga (2.5 segundos)

    return () => clearTimeout(timer)
  }, [])

  // Buscar el componente de la simulación activa
  const ActiveComponent = activeSimulation ? simulations.find((sim) => sim.id === activeSimulation)?.component : null

  // Pantalla de carga con animación de agujero negro
  if (isLoading) {
    return (
      // <-- EDITABLE: Fondo de la pantalla de carga
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Fondo espacial animado con menor opacidad */}
        {/* <-- EDITABLE: URL del GIF de fondo espacial difuminado */}
        <div
          className="absolute inset-0 opacity-20 blur-sm"
          style={{
            backgroundImage: "url('https://i.pinimg.com/originals/9c/40/8a/9c408a7a291d363c43c8f2cd5f1c5ddf.gif')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Animación de agujero negro */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Agujero negro giratorio */}
          <div className="relative">
            {/* Anillo exterior giratorio */}
            <div className="w-32 h-32 border-4 border-transparent border-t-orange-500 border-r-orange-400 rounded-full animate-spin"></div>
            {/* Anillo medio */}
            <div
              className="absolute top-2 left-2 w-28 h-28 border-4 border-transparent border-t-blue-400 border-r-purple-500 rounded-full animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>
            {/* Centro del agujero negro */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black rounded-full shadow-2xl shadow-orange-500/50"></div>
            {/* Efecto de distorsión */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-radial from-transparent via-orange-500/20 to-transparent rounded-full animate-pulse"></div>
          </div>

          {/* Texto de carga */}
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">Iniciando Laboratorio Cuántico</h2>
            <p className="text-gray-300 animate-pulse">Cargando simulaciones interactivas...</p>
          </div>
        </div>

        {/* Partículas flotantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    // Contenedor principal con fondo espacial y tema oscuro elegante
    <div className="min-h-screen relative overflow-hidden">
      {/* <-- EDITABLE: Fondo principal con GIF espacial difuminado */}
      <div
        className="fixed inset-0 z-0 opacity-40 blur-[1px]"
        style={{
          backgroundImage: "url('https://i.pinimg.com/originals/9c/40/8a/9c408a7a291d363c43c8f2cd5f1c5ddf.gif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Overlay oscuro para mejorar legibilidad */}
      {/* <-- EDITABLE: Opacidad del overlay */}
      <div className="fixed inset-0 bg-black/80 z-10" />

      {/* Contenido principal */}
      <div className="relative z-20 min-h-screen">
        {/* <-- CHANGE: Header eliminado completamente */}

        {/* Contenido principal */}
        <main className="container mx-auto px-4 py-12">
          {!activeSimulation ? (
            /* Vista de la página principal con animaciones de entrada */
            <div
              className={`space-y-12 transition-all duration-1000 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              {/* Título principal con efecto espacial */}
              <div className="text-center space-y-6">
                <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-orange-400 bg-clip-text text-transparent animate-pulse">
                  Laboratorio Cuántico
                </h1>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Explora el cosmos de la física a través de simulaciones interactivas, juegos educativos y herramientas
                  avanzadas de cálculo.
                </p>
              </div>

              {/* <-- CHANGE: Grid de simulaciones principales con previsualizaciones */}
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-white text-center mb-8">Simulaciones Principales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                  {simulations.map((simulation, index) => {
                    const Icon = simulation.icon
                    return (
                      <Card
                        key={simulation.id}
                        className={`bg-black/40 border-white/20 backdrop-blur-md hover:bg-black/60 transition-all duration-500 cursor-pointer group hover:scale-105 hover:${simulation.glowColor} hover:shadow-2xl ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                        style={{ animationDelay: `${index * 200}ms` }}
                        onClick={() => setActiveSimulation(simulation.id)}
                      >
                        {/* <-- CHANGE: Imagen de previsualización agregada */}
                        <div className="relative overflow-hidden rounded-t-lg">
                          <img
                            src={simulation.preview || "/placeholder.svg"}
                            alt={`Preview de ${simulation.title}`}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute top-4 right-4">
                            <div
                              className={`w-12 h-12 bg-gradient-to-br ${simulation.color} rounded-lg flex items-center justify-center shadow-lg ${simulation.glowColor}`}
                            >
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>

                        <CardHeader>
                          <CardTitle className="text-2xl text-white group-hover:text-blue-300 transition-colors">
                            {simulation.title}
                          </CardTitle>
                          <Badge className="w-fit bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none">
                            Simulación Interactiva
                          </Badge>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-gray-300 text-lg leading-relaxed mb-6">
                            {simulation.description}
                          </CardDescription>
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none text-lg py-3 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30">
                            Iniciar Simulación
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* <-- CHANGE: Secciones educativas adicionales */}
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-white text-center mb-8">Herramientas de Aprendizaje</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                  {educationalSections.map((section, index) => {
                    const Icon = section.icon
                    return (
                      <Card
                        key={section.id}
                        className={`bg-black/40 border-white/20 backdrop-blur-md hover:bg-black/60 transition-all duration-500 cursor-pointer group hover:scale-105 hover:${section.glowColor} hover:shadow-2xl ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                        style={{ animationDelay: `${(index + 2) * 200}ms` }}
                      >
                        {/* <-- CHANGE: Imagen de previsualización para cada sección */}
                        <div className="relative overflow-hidden rounded-t-lg">
                          <img
                            src={section.preview || "/placeholder.svg"}
                            alt={`Preview de ${section.title}`}
                            className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute top-2 right-2">
                            <div
                              className={`w-8 h-8 bg-gradient-to-br ${section.color} rounded-lg flex items-center justify-center shadow-lg ${section.glowColor}`}
                            >
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>

                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-white group-hover:text-blue-300 transition-colors">
                            {section.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-gray-300 text-sm leading-relaxed mb-4">
                            {section.description}
                          </CardDescription>
                          {/* <-- REDIRECCIÓN: Enlaces a páginas específicas */}
                          <Link href={section.href}>
                            <Button
                              className={`w-full bg-gradient-to-r ${section.color} hover:opacity-90 text-white border-none text-sm py-2 transition-all duration-300 hover:shadow-lg hover:${section.glowColor}`}
                            >
                              Explorar
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Vista de simulación activa */
            <div className="space-y-6">
              {/* Navegación de simulación */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">
                  {simulations.find((sim) => sim.id === activeSimulation)?.title}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setActiveSimulation(null)}
                  className="bg-black/40 border-white/20 text-white hover:bg-black/60 backdrop-blur-md"
                >
                  Volver al Laboratorio
                </Button>
              </div>

              {/* Renderizar el componente de la simulación activa */}
              {ActiveComponent && <ActiveComponent />}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
