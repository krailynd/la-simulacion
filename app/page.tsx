"use client"

// Importaciones necesarias para React y componentes UI
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
// Importación de las simulaciones de física
import { BalancingActSimulation } from "@/components/simulations/balancing-act"
import { ProjectileMotionSimulation } from "@/components/simulations/projectile-motion"
// Iconos de Lucide React para la interfaz
import { Scale, Target, Home, BookOpen, Calculator, Moon, Sun } from "lucide-react"
import Link from "next/link"

// Configuración de las simulaciones disponibles
const simulations = [
  {
    id: "balancing-act", // ID único para identificar la simulación
    title: "Acto de Equilibrio", // Título mostrado al usuario
    description: "Aprende sobre torque y equilibrio con una balanza interactiva.", // Descripción educativa
    icon: Scale, // Icono de balanza
    component: BalancingActSimulation, // Componente React de la simulación
    color: "bg-purple-500", // <-- EDITABLE: Color de fondo del ícono (puedes cambiar por bg-blue-500, bg-green-500, etc.)
  },
  {
    id: "projectile-motion", // ID único para movimiento de proyectiles
    title: "Movimiento de Proyectiles", // Título de la simulación
    description: "Simula el movimiento de objetos lanzados bajo la influencia de la gravedad.", // Descripción física
    icon: Target, // Icono de objetivo
    component: ProjectileMotionSimulation, // Componente de la simulación
    color: "bg-red-500", // <-- EDITABLE: Color de fondo del ícono (puedes cambiar por bg-orange-500, bg-pink-500, etc.)
  },
]

// Componente principal de la aplicación de simulaciones de física
export default function PhysicsSimulationsHome() {
  // Estado para controlar qué simulación está activa (null = página principal)
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null)
  // Estado para controlar el modo oscuro/claro
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Buscar el componente de la simulación activa
  const ActiveComponent = activeSimulation ? simulations.find((sim) => sim.id === activeSimulation)?.component : null

  // Función para alternar entre modo oscuro y claro
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // Aplicar la clase 'dark' al elemento html para activar el modo oscuro de Tailwind
    document.documentElement.classList.toggle("dark", !isDarkMode)
  }

  return (
    // Contenedor principal con altura completa y fondo adaptable al tema
    // <-- EDITABLE: Puedes cambiar 'bg-background' por 'bg-slate-50', 'bg-gray-100', etc.
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "dark bg-gray-900" : "bg-background"}`}>
      {/* Encabezado de la aplicación */}
      {/* <-- EDITABLE: Puedes cambiar 'bg-card' por 'bg-white', 'bg-slate-100', etc. */}
      <header
        className={`border-b border-border transition-colors duration-300 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-card"}`}
      >
        <div className="container mx-auto px-4 py-6">
          {" "}
          {/* Contenedor responsivo con padding */}
          <div className="flex items-center justify-between">
            {" "}
            {/* Flexbox para alinear elementos */}
            {/* Logo y título de la aplicación */}
            <div className="flex items-center gap-3">
              {/* Icono del logo */}
              {/* <-- EDITABLE: Puedes cambiar 'bg-primary' por 'bg-blue-600', 'bg-green-600', etc. */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${isDarkMode ? "bg-blue-600" : "bg-primary"}`}
              >
                <BookOpen className={`w-6 h-6 ${isDarkMode ? "text-white" : "text-primary-foreground"}`} />
              </div>
              {/* Información del título */}
              <div>
                <h1
                  className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-foreground"}`}
                >
                  Simulaciones de Física
                </h1>
                <p
                  className={`transition-colors duration-300 ${isDarkMode ? "text-gray-300" : "text-muted-foreground"}`}
                >
                  Laboratorio Virtual Interactivo
                </p>
              </div>
            </div>
            {/* Controles del encabezado */}
            <div className="flex items-center gap-2">
              {/* Control de modo oscuro */}
              <div className="flex items-center gap-2">
                <Sun className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-yellow-500"}`} />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={toggleDarkMode}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Moon className={`w-4 h-4 ${isDarkMode ? "text-blue-400" : "text-gray-400"}`} />
              </div>

              {/* Enlace a la calculadora científica */}
              {/* <-- REDIRECCIÓN: Este <Link> redirige a la página /calculator */}
              <Link href="/calculator">
                <Button
                  variant="outline"
                  className={`flex items-center gap-2 transition-colors duration-300 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600" : "bg-transparent"}`}
                >
                  <Calculator className="w-4 h-4" />
                  Calculadora Científica
                </Button>
              </Link>

              {/* Botón para volver al inicio (solo visible cuando hay una simulación activa) */}
              {activeSimulation && (
                <Button
                  variant="outline"
                  onClick={() => setActiveSimulation(null)} // Función para volver a la página principal
                  className={`flex items-center gap-2 transition-colors duration-300 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600" : ""}`}
                >
                  <Home className="w-4 h-4" />
                  Volver al Inicio
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navegación entre simulaciones (solo visible cuando hay una simulación activa) */}
      {activeSimulation && (
        // <-- EDITABLE: Puedes cambiar 'bg-card' por 'bg-white', 'bg-slate-50', etc.
        <nav
          className={`border-b border-border transition-colors duration-300 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-card"}`}
        >
          <div className="container mx-auto px-4">
            <div className="flex gap-2 py-3 overflow-x-auto">
              {" "}
              {/* Scroll horizontal para dispositivos móviles */}
              {simulations.map((sim) => {
                const Icon = sim.icon // Obtener el componente del icono
                return (
                  <Button
                    key={sim.id}
                    variant={activeSimulation === sim.id ? "default" : "ghost"} // Estilo activo/inactivo
                    size="sm"
                    onClick={() => setActiveSimulation(sim.id)} // Cambiar simulación activa
                    className={`flex items-center gap-2 whitespace-nowrap transition-colors duration-300 ${
                      isDarkMode
                        ? activeSimulation === sim.id
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-700"
                        : ""
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {sim.title}
                  </Button>
                )
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8">
        {!activeSimulation ? (
          /* Vista de la página principal */
          <div className="space-y-8">
            {/* Sección de bienvenida */}
            <div className="text-center space-y-4">
              <h2
                className={`text-3xl font-bold text-balance transition-colors duration-300 ${isDarkMode ? "text-white" : ""}`}
              >
                Explora el Mundo de la Física
              </h2>
              <p
                className={`text-lg max-w-2xl mx-auto text-pretty transition-colors duration-300 ${isDarkMode ? "text-gray-300" : "text-muted-foreground"}`}
              >
                Descubre los principios fundamentales de la física a través de simulaciones interactivas. Cada
                experimento te ayudará a comprender conceptos complejos de manera visual y práctica.
              </p>
            </div>

            {/* Grid de simulaciones disponibles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {simulations.map((simulation) => {
                const Icon = simulation.icon
                return (
                  <Card
                    key={simulation.id}
                    className={`hover:shadow-lg transition-all duration-300 cursor-pointer group ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 hover:bg-gray-750 hover:shadow-blue-500/20"
                        : "hover:shadow-lg"
                    }`}
                    onClick={() => setActiveSimulation(simulation.id)} // Activar simulación al hacer clic
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {/* Icono de la simulación */}
                        {/* <-- EDITABLE: El color se define en simulation.color arriba */}
                        <div
                          className={`w-12 h-12 ${simulation.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle
                            className={`text-xl transition-colors duration-300 ${isDarkMode ? "text-white" : ""}`}
                          >
                            {simulation.title}
                          </CardTitle>
                          <Badge
                            variant="secondary"
                            className={`mt-1 transition-colors duration-300 ${isDarkMode ? "bg-gray-700 text-gray-300" : ""}`}
                          >
                            Interactivo
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription
                        className={`text-base leading-relaxed transition-colors duration-300 ${isDarkMode ? "text-gray-300" : ""}`}
                      >
                        {simulation.description}
                      </CardDescription>
                      <Button
                        className={`w-full mt-4 group-hover:bg-primary/90 transition-colors duration-300 ${
                          isDarkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : ""
                        }`}
                      >
                        Iniciar Simulación
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Tarjeta de la calculadora científica */}
            <div className="max-w-2xl mx-auto">
              <Card
                className={`hover:shadow-lg transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 hover:bg-gray-750 hover:shadow-blue-500/20"
                    : "hover:shadow-lg"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {/* <-- EDITABLE: Puedes cambiar 'bg-blue-500' por otro color */}
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Calculator className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className={`text-xl transition-colors duration-300 ${isDarkMode ? "text-white" : ""}`}>
                        Calculadora Científica
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className={`mt-1 transition-colors duration-300 ${isDarkMode ? "bg-gray-700 text-gray-300" : ""}`}
                      >
                        Herramienta
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription
                    className={`text-base leading-relaxed transition-colors duration-300 ${isDarkMode ? "text-gray-300" : ""}`}
                  >
                    Calculadora científica avanzada con funciones matemáticas, gráficos y herramientas estilo GeoGebra
                    para resolver problemas de física.
                  </CardDescription>
                  {/* <-- REDIRECCIÓN: Este <Link> redirige a la página /calculator */}
                  <Link href="/calculator">
                    <Button
                      className={`w-full mt-4 transition-colors duration-300 ${
                        isDarkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : ""
                      }`}
                    >
                      Abrir Calculadora
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Sección de instrucciones */}
            {/* <-- EDITABLE: Puedes cambiar 'bg-card' por 'bg-white', 'bg-slate-50', etc. */}
            <div
              className={`rounded-lg p-6 border transition-colors duration-300 ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-card border-border"
              }`}
            >
              <h3
                className={`text-xl font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? "text-white" : ""}`}
              >
                Instrucciones de Uso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {/* Cada sección de instrucciones */}
                <div className="space-y-2">
                  <h4
                    className={`font-medium transition-colors duration-300 ${isDarkMode ? "text-blue-400" : "text-primary"}`}
                  >
                    🎯 Cómo Empezar
                  </h4>
                  <p
                    className={`transition-colors duration-300 ${isDarkMode ? "text-gray-300" : "text-muted-foreground"}`}
                  >
                    Haz clic en cualquier simulación para comenzar. Cada una incluye controles interactivos y
                    explicaciones.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4
                    className={`font-medium transition-colors duration-300 ${isDarkMode ? "text-blue-400" : "text-primary"}`}
                  >
                    🔧 Controles
                  </h4>
                  <p
                    className={`transition-colors duration-300 ${isDarkMode ? "text-gray-300" : "text-muted-foreground"}`}
                  >
                    Usa los deslizadores y botones para modificar variables y observar los cambios en tiempo real.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4
                    className={`font-medium transition-colors duration-300 ${isDarkMode ? "text-blue-400" : "text-primary"}`}
                  >
                    📊 Datos
                  </h4>
                  <p
                    className={`transition-colors duration-300 ${isDarkMode ? "text-gray-300" : "text-muted-foreground"}`}
                  >
                    Observa las gráficas y mediciones que se actualizan automáticamente con tus experimentos.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4
                    className={`font-medium transition-colors duration-300 ${isDarkMode ? "text-blue-400" : "text-primary"}`}
                  >
                    🧮 Calculadora
                  </h4>
                  <p
                    className={`transition-colors duration-300 ${isDarkMode ? "text-gray-300" : "text-muted-foreground"}`}
                  >
                    Usa la calculadora científica para resolver problemas complejos y verificar tus cálculos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Vista de simulación activa */
          <div className="space-y-6">
            {/* Título de la simulación activa */}
            <div className="text-center">
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : ""}`}>
                {simulations.find((sim) => sim.id === activeSimulation)?.title}
              </h2>
              <p className={`transition-colors duration-300 ${isDarkMode ? "text-gray-300" : "text-muted-foreground"}`}>
                {simulations.find((sim) => sim.id === activeSimulation)?.description}
              </p>
            </div>

            {/* Renderizar el componente de la simulación activa */}
            {ActiveComponent && <ActiveComponent />}
          </div>
        )}
      </main>

      {/* Pie de página */}
      {/* <-- EDITABLE: Puedes cambiar 'bg-card' por 'bg-white', 'bg-slate-100', etc. */}
      <footer
        className={`border-t mt-16 transition-colors duration-300 ${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-card border-border"
        }`}
      >
        <div className="container mx-auto px-4 py-6">
          <div
            className={`text-center text-sm transition-colors duration-300 ${isDarkMode ? "text-gray-400" : "text-muted-foreground"}`}
          >
            <p>Simulaciones de Física Interactivas • Desarrollado para el aprendizaje educativo</p>
            <p className="mt-1"></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
