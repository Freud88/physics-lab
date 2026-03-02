import { useRef, useEffect } from 'react'

export interface GraphPoint {
  t: number
  y: number
}

interface GraphProps {
  points: GraphPoint[]
  currentT: number
  label: string
  unit: string
  color: string
  /** Y-axis range. If not provided, auto-scaled from data. */
  yMin?: number
  yMax?: number
}

const PADDING = { top: 10, right: 10, bottom: 24, left: 42 }

export default function Graph({ points, currentT, label, unit, color, yMin, yMax }: GraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const pl = PADDING.left, pr = PADDING.right, pt = PADDING.top, pb = PADDING.bottom
    const gW = W - pl - pr
    const gH = H - pt - pb

    ctx.clearRect(0, 0, W, H)

    if (points.length < 2) return

    const tMin = points[0]!.t
    const tMax = points[points.length - 1]!.t

    const allY = points.map(p => p.y)
    let dataYMin = yMin ?? Math.min(...allY)
    let dataYMax = yMax ?? Math.max(...allY)
    if (dataYMax === dataYMin) { dataYMin -= 1; dataYMax += 1 }
    const yPad = (dataYMax - dataYMin) * 0.1
    const yLo = dataYMin - yPad
    const yHi = dataYMax + yPad

    const toX = (t: number) => pl + ((t - tMin) / (tMax - tMin)) * gW
    const toY = (v: number) => pt + gH - ((v - yLo) / (yHi - yLo)) * gH

    // Grid
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 4])
    for (let i = 0; i <= 4; i++) {
      const yv = yLo + (i / 4) * (yHi - yLo)
      const yp = toY(yv)
      ctx.beginPath()
      ctx.moveTo(pl, yp)
      ctx.lineTo(pl + gW, yp)
      ctx.stroke()
    }
    ctx.setLineDash([])

    // Axes
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(pl, pt)
    ctx.lineTo(pl, pt + gH)
    ctx.lineTo(pl + gW, pt + gH)
    ctx.stroke()

    // Axis labels
    ctx.fillStyle = '#64748b'
    ctx.font = '10px system-ui'
    ctx.textAlign = 'right'
    for (let i = 0; i <= 4; i++) {
      const yv = yLo + (i / 4) * (yHi - yLo)
      const yp = toY(yv)
      ctx.fillText(yv.toFixed(1), pl - 4, yp + 3.5)
    }

    // Curve
    const visiblePoints = points.filter(p => p.t <= currentT)
    if (visiblePoints.length > 1) {
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'
      ctx.beginPath()
      visiblePoints.forEach((p, i) => {
        const px = toX(p.t)
        const py = toY(p.y)
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      })
      ctx.stroke()
    }

    // Current point dot
    if (visiblePoints.length > 0) {
      const last = visiblePoints[visiblePoints.length - 1]!
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(toX(last.t), toY(last.y), 4, 0, Math.PI * 2)
      ctx.fill()
    }

    // Label
    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 10px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText(`${label} (${unit})`, pl + 4, pt + 10)
  }, [points, currentT, label, unit, color, yMin, yMax])

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={120}
      className="w-full h-full"
      style={{ imageRendering: 'auto' }}
    />
  )
}
