import { useState, useEffect, useRef, useCallback } from 'react'
import VectorArrow from '../../components/VectorArrow'
import Graph, { GraphPoint } from '../../components/Graph'
import TimeBar from '../../components/TimeBar'

function buildPoints(v0: number, a: number, x0: number, duration: number, steps = 300) {
  const x: GraphPoint[] = []
  const v: GraphPoint[] = []
  const acc: GraphPoint[] = []
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * duration
    x.push({ t, y: x0 + v0 * t + 0.5 * a * t * t })
    v.push({ t, y: v0 + a * t })
    acc.push({ t, y: a })
  }
  return { x, v, acc }
}

export default function MRUA() {
  const [v0, setV0] = useState(10)
  const [a, setA] = useState(-2)
  const [x0, setX0] = useState(0)
  const [duration, setDuration] = useState(5)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)

  const xPos = x0 + v0 * currentTime + 0.5 * a * currentTime * currentTime
  const vNow = v0 + a * currentTime
  const graphData = buildPoints(v0, a, x0, duration)

  const tick = useCallback((ts: number) => {
    if (lastTsRef.current === null) lastTsRef.current = ts
    const dt = (ts - lastTsRef.current) / 1000
    lastTsRef.current = ts
    setCurrentTime(prev => {
      const next = prev + dt
      if (next >= duration) { setIsPlaying(false); return duration }
      return next
    })
    rafRef.current = requestAnimationFrame(tick)
  }, [duration])

  useEffect(() => {
    if (isPlaying) {
      lastTsRef.current = null
      rafRef.current = requestAnimationFrame(tick)
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [isPlaying, tick])

  function handleReset() { setIsPlaying(false); setCurrentTime(0) }
  function handlePlay() { if (currentTime >= duration) setCurrentTime(0); setIsPlaying(true) }

  // Scene
  const svgW = 560, svgH = 180
  const trackY = 100
  const allX = graphData.x.map(p => p.y)
  const xMin = Math.min(...allX), xMax = Math.max(...allX)
  const xRange = Math.max(10, xMax - xMin + Math.abs(x0) * 0.3 + 5)
  const xCenter = (xMin + xMax) / 2
  const toSvgX = (x: number) => svgW / 2 + ((x - xCenter) / xRange) * svgW * 0.8
  const bodyX = Math.max(16, Math.min(svgW - 16, toSvgX(xPos)))

  const velLen = Math.min(90, Math.max(0, Math.abs(vNow) * 10))
  const velDir = vNow >= 0 ? 1 : -1
  const accLen = Math.min(70, Math.max(0, Math.abs(a) * 18))
  const accDir = a >= 0 ? 1 : -1

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 min-h-0">
        {/* Left: controls */}
        <aside className="w-56 flex-shrink-0 border-r border-slate-800 bg-slate-900/50 p-4 overflow-y-auto">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Parametri MRUA</h3>
          <div className="space-y-5">
            <SliderInput label="Velocità iniziale v₀" unit="m/s" min={-20} max={20} step={0.5} value={v0}
              onChange={v => { setV0(v); handleReset() }} />
            <SliderInput label="Accelerazione a" unit="m/s²" min={-10} max={10} step={0.5} value={a}
              onChange={v => { setA(v); handleReset() }} />
            <SliderInput label="Posizione iniziale x₀" unit="m" min={-30} max={30} step={1} value={x0}
              onChange={v => { setX0(v); handleReset() }} />
            <SliderInput label="Durata" unit="s" min={1} max={20} step={0.5} value={duration}
              onChange={v => { setDuration(v); handleReset() }} />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Valori attuali</h4>
            <InfoRow label="x(t)" value={`${xPos.toFixed(2)} m`} />
            <InfoRow label="v(t)" value={`${vNow.toFixed(2)} m/s`} color="text-sky-400" />
            <InfoRow label="a" value={`${a.toFixed(2)} m/s²`} color="text-orange-400" />
            <InfoRow label="t" value={`${currentTime.toFixed(2)} s`} />
          </div>

          <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 space-y-1">
            <p className="text-xs text-slate-500 font-mono">x(t) = x₀ + v₀t + ½at²</p>
            <p className="text-xs text-slate-500 font-mono">v(t) = v₀ + at</p>
          </div>
        </aside>

        {/* Right: scene + graphs */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Scene */}
          <div className="flex-1 bg-slate-950 flex items-center justify-center min-h-0 overflow-hidden p-2">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full" style={{ maxHeight: 200 }} preserveAspectRatio="xMidYMid meet">
              {/* Track */}
              <line x1={20} y1={trackY} x2={svgW - 20} y2={trackY} stroke="#1e293b" strokeWidth={2} />
              <line x1={20} y1={trackY} x2={svgW - 20} y2={trackY} stroke="#334155" strokeWidth={1.5} strokeDasharray="4 6" />

              {/* Tick marks */}
              {Array.from({ length: 9 }, (_, i) => {
                const worldX = xCenter - xRange / 2 + ((i + 0.5) / 8) * xRange
                const sx = toSvgX(worldX)
                return (
                  <g key={i}>
                    <line x1={sx} y1={trackY - 4} x2={sx} y2={trackY + 4} stroke="#334155" strokeWidth={1} />
                    <text x={sx} y={trackY + 15} fill="#475569" fontSize="9" textAnchor="middle">{worldX.toFixed(0)}</text>
                  </g>
                )
              })}

              {/* x₀ marker */}
              <line x1={toSvgX(x0)} y1={trackY - 20} x2={toSvgX(x0)} y2={trackY + 4} stroke="#64748b" strokeWidth={1} strokeDasharray="3 3" />
              <text x={toSvgX(x0)} y={trackY - 24} fill="#64748b" fontSize="9" textAnchor="middle">x₀</text>

              {/* Body */}
              <circle cx={bodyX} cy={trackY} r={13} fill="#0369a1" stroke="#38bdf8" strokeWidth={1.5} />
              <circle cx={bodyX} cy={trackY} r={4} fill="#bae6fd" />

              {/* Acceleration arrow (below body, orange) */}
              <VectorArrow
                x={bodyX} y={trackY + 28}
                dx={accDir} dy={0}
                length={accLen}
                color="#f97316"
                label="a"
                strokeWidth={2.5}
              />

              {/* Velocity arrow (above body, blue) */}
              <VectorArrow
                x={bodyX} y={trackY - 28}
                dx={velDir} dy={0}
                length={velLen}
                color="#38bdf8"
                label="v"
                strokeWidth={2.5}
              />
            </svg>
          </div>

          {/* Graphs */}
          <div className="grid grid-cols-3 gap-2 px-3 py-3 border-t border-slate-800 bg-slate-900/30">
            <div className="bg-slate-900 rounded-lg p-1 border border-slate-800" style={{ height: 130 }}>
              <Graph points={graphData.x} currentT={currentTime} label="x(t)" unit="m" color="#38bdf8" />
            </div>
            <div className="bg-slate-900 rounded-lg p-1 border border-slate-800" style={{ height: 130 }}>
              <Graph points={graphData.v} currentT={currentTime} label="v(t)" unit="m/s" color="#818cf8" />
            </div>
            <div className="bg-slate-900 rounded-lg p-1 border border-slate-800" style={{ height: 130 }}>
              <Graph points={graphData.acc} currentT={currentTime} label="a(t)" unit="m/s²" color="#fb923c" />
            </div>
          </div>
        </div>
      </div>

      <TimeBar
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onPause={() => setIsPlaying(false)}
        onReset={handleReset}
        onSeek={(t) => { setCurrentTime(t); setIsPlaying(false) }}
      />
    </div>
  )
}

interface SliderInputProps {
  label: string; unit: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void
}
function SliderInput({ label, unit, min, max, step, value, onChange }: SliderInputProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-xs text-slate-400">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            className="w-16 text-right bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            value={value} step={step} min={min} max={max}
            onChange={e => { const n = parseFloat(e.target.value); if (!isNaN(n)) onChange(n) }}
          />
          <span className="text-xs text-slate-600">{unit}</span>
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1 accent-sky-500 cursor-pointer"
      />
    </div>
  )
}

function InfoRow({ label, value, color = 'text-slate-300' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-slate-500 font-mono">{label}</span>
      <span className={`font-mono font-medium ${color}`}>{value}</span>
    </div>
  )
}
