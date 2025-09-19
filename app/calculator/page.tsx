"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, Home, History, Trash2, FenceIcon as Function, BarChart3, Grid3X3 } from "lucide-react"
import Link from "next/link"

interface CalculationHistory {
  id: number
  expression: string
  result: string
  timestamp: Date
}

interface GraphPoint {
  x: number
  y: number
}

export default function ScientificCalculator() {
  const [display, setDisplay] = useState("0")
  const [expression, setExpression] = useState("")
  const [history, setHistory] = useState<CalculationHistory[]>([])
  const [memory, setMemory] = useState(0)
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg")

  // Graphing calculator state
  const [graphFunction, setGraphFunction] = useState("sin(x)")
  const [graphPoints, setGraphPoints] = useState<GraphPoint[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Matrix calculator state
  const [matrixA, setMatrixA] = useState([
    ["1", "2"],
    ["3", "4"],
  ])
  const [matrixB, setMatrixB] = useState([
    ["5", "6"],
    ["7", "8"],
  ])
  const [matrixResult, setMatrixResult] = useState<string[][]>([])

  const addToHistory = (expr: string, result: string) => {
    const newEntry: CalculationHistory = {
      id: Date.now(),
      expression: expr,
      result: result,
      timestamp: new Date(),
    }
    setHistory((prev) => [...prev.slice(-19), newEntry])
  }

  const evaluateExpression = (expr: string): number => {
    try {
      // Replace mathematical functions
      const processedExpr = expr
        .replace(/sin\(/g, angleMode === "deg" ? "Math.sin(Math.PI/180*" : "Math.sin(")
        .replace(/cos\(/g, angleMode === "deg" ? "Math.cos(Math.PI/180*" : "Math.cos(")
        .replace(/tan\(/g, angleMode === "deg" ? "Math.tan(Math.PI/180*" : "Math.tan(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/\^/g, "**")
        .replace(/π/g, "Math.PI")
        .replace(/e/g, "Math.E")

      return Function(`"use strict"; return (${processedExpr})`)()
    } catch {
      throw new Error("Error de sintaxis")
    }
  }

  const handleNumber = (num: string) => {
    if (display === "0" || display === "Error") {
      setDisplay(num)
      setExpression(num)
    } else {
      setDisplay(display + num)
      setExpression(expression + num)
    }
  }

  const handleOperator = (op: string) => {
    setDisplay(display + op)
    setExpression(expression + op)
  }

  const handleFunction = (func: string) => {
    const newExpr = expression + func + "("
    setDisplay(display + func + "(")
    setExpression(newExpr)
  }

  const handleEquals = () => {
    try {
      const result = evaluateExpression(expression)
      const resultStr = result.toString()
      setDisplay(resultStr)
      addToHistory(expression, resultStr)
      setExpression(resultStr)
    } catch (error) {
      setDisplay("Error")
      setExpression("")
    }
  }

  const handleClear = () => {
    setDisplay("0")
    setExpression("")
  }

  const handleBackspace = () => {
    if (display.length > 1) {
      const newDisplay = display.slice(0, -1)
      const newExpression = expression.slice(0, -1)
      setDisplay(newDisplay)
      setExpression(newExpression)
    } else {
      setDisplay("0")
      setExpression("")
    }
  }

  const loadFromHistory = (item: CalculationHistory) => {
    setDisplay(item.result)
    setExpression(item.result)
  }

  const clearHistory = () => {
    setHistory([])
  }

  // Graph function
  const plotFunction = () => {
    try {
      const points: GraphPoint[] = []
      for (let x = -10; x <= 10; x += 0.1) {
        const expr = graphFunction.replace(/x/g, x.toString())
        const y = evaluateExpression(expr)
        if (!isNaN(y) && isFinite(y)) {
          points.push({ x, y })
        }
      }
      setGraphPoints(points)
    } catch (error) {
      console.error("Error plotting function:", error)
    }
  }

  // Draw graph
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || graphPoints.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1

    // Vertical lines
    for (let x = 0; x <= canvas.width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw axes
    ctx.strokeStyle = "#374151"
    ctx.lineWidth = 2

    // X-axis
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.stroke()

    // Draw function
    ctx.strokeStyle = "#dc2626"
    ctx.lineWidth = 3
    ctx.beginPath()

    const scaleX = canvas.width / 20 // -10 to 10
    const scaleY = canvas.height / 20 // -10 to 10
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    graphPoints.forEach((point, index) => {
      const x = centerX + point.x * scaleX
      const y = centerY - point.y * scaleY

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()
  }, [graphPoints])

  // Matrix operations
  const multiplyMatrices = () => {
    try {
      const a = matrixA.map((row) => row.map((cell) => Number.parseFloat(cell)))
      const b = matrixB.map((row) => row.map((cell) => Number.parseFloat(cell)))

      if (a[0].length !== b.length) {
        throw new Error("Dimensiones incompatibles")
      }

      const result = []
      for (let i = 0; i < a.length; i++) {
        result[i] = []
        for (let j = 0; j < b[0].length; j++) {
          let sum = 0
          for (let k = 0; k < b.length; k++) {
            sum += a[i][k] * b[k][j]
          }
          result[i][j] = sum.toString()
        }
      }
      setMatrixResult(result)
    } catch (error) {
      console.error("Error en multiplicación de matrices:", error)
    }
  }

  const addMatrices = () => {
    try {
      const a = matrixA.map((row) => row.map((cell) => Number.parseFloat(cell)))
      const b = matrixB.map((row) => row.map((cell) => Number.parseFloat(cell)))

      const result = a.map((row, i) => row.map((cell, j) => (cell + b[i][j]).toString()))
      setMatrixResult(result)
    } catch (error) {
      console.error("Error en suma de matrices:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Calculadora Científica</h1>
                <p className="text-muted-foreground">Herramientas matemáticas avanzadas</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Home className="w-4 h-4" />
                Volver a Simulaciones
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Calculadora
            </TabsTrigger>
            <TabsTrigger value="graphing" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Gráficos
            </TabsTrigger>
            <TabsTrigger value="matrix" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Matrices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calculator */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Calculadora Científica
                    <div className="flex gap-2">
                      <Badge variant={angleMode === "deg" ? "default" : "outline"}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAngleMode(angleMode === "deg" ? "rad" : "deg")}
                          className="h-auto p-0 text-xs"
                        >
                          {angleMode.toUpperCase()}
                        </Button>
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Display */}
                  <div className="mb-4">
                    <Input value={display} readOnly className="text-right text-2xl font-mono h-16 text-lg" />
                    <div className="text-xs text-muted-foreground mt-1 text-right">{expression}</div>
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-6 gap-2">
                    {/* Row 1 - Functions */}
                    <Button variant="outline" onClick={() => handleFunction("sin")}>
                      sin
                    </Button>
                    <Button variant="outline" onClick={() => handleFunction("cos")}>
                      cos
                    </Button>
                    <Button variant="outline" onClick={() => handleFunction("tan")}>
                      tan
                    </Button>
                    <Button variant="outline" onClick={() => handleFunction("log")}>
                      log
                    </Button>
                    <Button variant="outline" onClick={() => handleFunction("ln")}>
                      ln
                    </Button>
                    <Button variant="outline" onClick={() => handleFunction("sqrt")}>
                      √
                    </Button>

                    {/* Row 2 - More functions */}
                    <Button variant="outline" onClick={() => handleOperator("^")}>
                      x^y
                    </Button>
                    <Button variant="outline" onClick={() => handleOperator("π")}>
                      π
                    </Button>
                    <Button variant="outline" onClick={() => handleOperator("e")}>
                      e
                    </Button>
                    <Button variant="outline" onClick={() => handleOperator("(")}>
                      (
                    </Button>
                    <Button variant="outline" onClick={() => handleOperator(")")}>
                      )
                    </Button>
                    <Button variant="destructive" onClick={handleClear}>
                      C
                    </Button>

                    {/* Row 3 */}
                    <Button variant="outline" onClick={() => handleNumber("7")}>
                      7
                    </Button>
                    <Button variant="outline" onClick={() => handleNumber("8")}>
                      8
                    </Button>
                    <Button variant="outline" onClick={() => handleNumber("9")}>
                      9
                    </Button>
                    <Button variant="outline" onClick={() => handleOperator("/")}>
                      /
                    </Button>
                    <Button variant="outline" onClick={() => handleOperator("%")}>
                      %
                    </Button>
                    <Button variant="outline" onClick={handleBackspace}>
                      ⌫
                    </Button>

                    {/* Row 4 */}
                    <Button variant="outline" onClick={() => handleNumber("4")}>
                      4
                    </Button>
                    <Button variant="outline" onClick={() => handleNumber("5")}>
                      5
                    </Button>
                    <Button variant="outline" onClick={() => handleNumber("6")}>
                      6
                    </Button>
                    <Button variant="outline" onClick={() => handleOperator("*")}>
                      ×
                    </Button>
                    <Button variant="outline" onClick={() => handleOperator("!")}>
                      !
                    </Button>
                    <Button variant="outline" onClick={() => setMemory(Number.parseFloat(display))}>
                      MS
                    </Button>

                    {/* Row 5 */}
                    <Button variant="outline" onClick={() => handleNumber("1")}>
                      1
                    </Button>
                    <Button variant="outline" onClick={() => handleNumber("2")}>
                      2
                    </Button>
                    <Button variant="outline" onClick={() => handleNumber("3")}>
                      3
                    </Button>
                    <Button variant="outline" onClick={() => handleOperator("-")}>
                      -
                    </Button>
                    <Button variant="outline" onClick={() => handleOperator("^2")}>
                      x²
                    </Button>
                    <Button variant="outline" onClick={() => setDisplay(memory.toString())}>
                      MR
                    </Button>

                    {/* Row 6 */}
                    <Button variant="outline" onClick={() => handleNumber("0")} className="col-span-2">
                      0
                    </Button>
                    <Button variant="outline" onClick={() => handleOperator(".")}>
                      .
                    </Button>
                    <Button variant="outline" onClick={() => handleOperator("+")}>
                      +
                    </Button>
                    <Button variant="default" onClick={handleEquals} className="col-span-2">
                      =
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Historial
                    </div>
                    <Button variant="outline" size="sm" onClick={clearHistory}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {history.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No hay cálculos en el historial</p>
                    ) : (
                      history
                        .slice()
                        .reverse()
                        .map((item) => (
                          <div
                            key={item.id}
                            className="p-2 rounded border cursor-pointer hover:bg-muted/50"
                            onClick={() => loadFromHistory(item)}
                          >
                            <div className="text-sm font-mono">{item.expression}</div>
                            <div className="text-lg font-bold">{item.result}</div>
                            <div className="text-xs text-muted-foreground">{item.timestamp.toLocaleTimeString()}</div>
                          </div>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="graphing">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Graficador de Funciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <canvas ref={canvasRef} width={600} height={400} className="border border-border rounded-lg w-full" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Controles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Función f(x):</label>
                    <Input
                      value={graphFunction}
                      onChange={(e) => setGraphFunction(e.target.value)}
                      placeholder="sin(x), x^2, etc."
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={plotFunction} className="w-full">
                    Graficar
                  </Button>

                  <div className="space-y-2">
                    <h4 className="font-medium">Funciones de ejemplo:</h4>
                    <div className="space-y-1">
                      {["sin(x)", "cos(x)", "x^2", "x^3", "sqrt(x)", "1/x", "log(x)"].map((func) => (
                        <Button
                          key={func}
                          variant="outline"
                          size="sm"
                          onClick={() => setGraphFunction(func)}
                          className="w-full text-left justify-start"
                        >
                          {func}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="matrix">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Calculadora de Matrices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Matrix A */}
                    <div>
                      <h4 className="font-medium mb-2">Matriz A</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {matrixA.map((row, i) =>
                          row.map((cell, j) => (
                            <Input
                              key={`a-${i}-${j}`}
                              value={cell}
                              onChange={(e) => {
                                const newMatrix = [...matrixA]
                                newMatrix[i][j] = e.target.value
                                setMatrixA(newMatrix)
                              }}
                              className="text-center"
                            />
                          )),
                        )}
                      </div>
                    </div>

                    {/* Matrix B */}
                    <div>
                      <h4 className="font-medium mb-2">Matriz B</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {matrixB.map((row, i) =>
                          row.map((cell, j) => (
                            <Input
                              key={`b-${i}-${j}`}
                              value={cell}
                              onChange={(e) => {
                                const newMatrix = [...matrixB]
                                newMatrix[i][j] = e.target.value
                                setMatrixB(newMatrix)
                              }}
                              className="text-center"
                            />
                          )),
                        )}
                      </div>
                    </div>

                    {/* Result */}
                    <div>
                      <h4 className="font-medium mb-2">Resultado</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {matrixResult.map((row, i) =>
                          row.map((cell, j) => (
                            <Input key={`r-${i}-${j}`} value={cell} readOnly className="text-center bg-muted" />
                          )),
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button onClick={addMatrices}>A + B</Button>
                    <Button onClick={multiplyMatrices}>A × B</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
