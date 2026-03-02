import { useState, useEffect, useRef, useCallback } from 'react'
import VectorArrow from '../../components/VectorArrow'
import Graph, { GraphPoint } from '../../components/Graph'
import TimeBar from '../../components/TimeBar'

function buildPoints(v0: number, y0: number, duration: number, steps = 300) {
  const x: GraphPoint[] = []
  const v: GraphPoint[] = []
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * duration
    x.push({ t, y: y0 + v0 * t })
    v.push({ t, y: v0 })
  }
  return { x, v }
}

export default function MRU() {
  const [v0, setV0] = useState(5)
  const [y0, setY0] = useState(50)
  const [duration, setDuration] = useState(5)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)

  // posizione attuale (positivo = verso il basso)
  const yPos = y0 - v0 * currentTime
  const graphData = buildPoints(v0, y0, duration)

  // scala automatica grafici
  const allY = graphData.x.map(p => p.y)
  const yMin = Math.min(...allY)
  const yMax = Math.max(...allY)
  const yPad = Math.max(1, (yMax - yMin) * 0.15)

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

  // Scene verticale
  const svgW = 200, svgH = 340
  const trackX = svgW / 2

  // range verticale: dalla posizione iniziale alla posizione finale
  const yFinal = y0 - v0 * duration
  const worldTop = Math.min(y0, yFinal) - 10
  const worldBot = Math.max(y0, yFinal) + 10
  const worldRange = Math.max(20, worldBot - worldTop)
  const toSvgY = (worldY: number) => 20 + ((worldY - worldTop) / worldRange) * (svgH - 40)

  const bodySvgY = Math.max(16, Math.min(svgH - 16, toSvgY(yPos)))
  const arrowLen = Math.min(80, Math.max(0, Math.abs(v0) * 8))
  // v0 > 0 → cade verso il basso → freccia verso il basso
  const velDirY = v0 >= 0 ? 1 : -1

  // etichette scala
  const nTicks = 5
  const ticks = Array.from({ length: nTicks }, (_, i) => {
    const worldY = worldTop + (i / (nTicks - 1)) * worldRange
    return { svgY: toSvgY(worldY), label: worldY.toFixed(0) }
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 min-h-0">
        {/* Left: controls */}
        <aside className="w-56 flex-shrink-0 border-r border-slate-800 bg-slate-900/50 p-4 overflow-y-auto">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Parametri MRU</h3>
          <div className="space-y-5">
            <SliderInput label="Velocità v₀" unit="m/s" min={-100} max={100} step={1} value={v0}
              onChange={v => { setV0(v); handleReset() }} />
            <SliderInput label="Altezza iniziale y₀" unit="m" min={0} max={500} step={5} value={y0}
              onChange={v => { setY0(v); handleReset() }} />
            <SliderInput label="Durata" unit="s" min={1} max={60} step={1} value={duration}
              onChange={v => { setDuration(v); handleReset() }} />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Valori attuali</h4>
            <InfoRow label="y(t)" value={`${(y0 - v0 * currentTime).toFixed(2)} m`} />
            <InfoRow label="v(t)" value={`${v0.toFixed(2)} m/s`} color="text-sky-400" />
            <InfoRow label="t" value={`${currentTime.toFixed(2)} s`} />
          </div>

          <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-500 font-mono">y(t) = y₀ + v₀·t</p>
          </div>
        </aside>

        {/* Right: scene + graphs */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Scena verticale */}
            <div className="flex-none bg-slate-950 flex items-center justify-center p-2" style={{ width: 180 }}>
              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="h-full" style={{ maxHeight: 340 }} preserveAspectRatio="xMidYMid meet">
                {/* Sfondo griglia */}
                {ticks.map((tk, i) => (
                  <g key={i}>
                    <line x1={30} y1={tk.svgY} x2={svgW - 10} y2={tk.svgY} stroke="#1e293b" strokeWidth={1} />
                    <text x={26} y={tk.svgY + 4} fill="#475569" fontSize="8" textAnchor="end">{tk.label}</text>
                  </g>
                ))}
                <text x={26} y={svgH - 4} fill="#64748b" fontSize="7" textAnchor="end">m</text>

                {/* Traccia verticale */}
                <line x1={trackX} y1={20} x2={trackX} y2={svgH - 20} stroke="#334155" strokeWidth={1.5} strokeDasharray="4 6" />

                {/* Marcatore y₀ */}
                <line x1={trackX - 12} y1={toSvgY(y0)} x2={trackX + 12} y2={toSvgY(y0)} stroke="#64748b" strokeWidth={1} strokeDasharray="3 3" />
                <text x={trackX + 16} y={toSvgY(y0) + 4} fill="#64748b" fontSize="8">y₀</text>

                {/* Corpo — scatola */}
                <rect
                  x={trackX - 14} y={bodySvgY - 14}
                  width={28} height={28}
                  rx={4}
                  fill="#0369a1" stroke="#38bdf8" strokeWidth={1.5}
                />
                {/* dettaglio scatola */}
                <line x1={trackX - 14} y1={bodySvgY} x2={trackX + 14} y2={bodySvgY} stroke="#38bdf8" strokeWidth={0.5} opacity={0.4} />

                {/* Vettore velocità */}
                <VectorArrow
                  x={trackX} y={bodySvgY}
                  dx={0} dy={velDirY}
                  length={arrowLen}
                  color="#38bdf8"
                  label="v"
                  strokeWidth={2.5}
                />
              </svg>
            </div>

            {/* Grafici */}
            <div className="flex-1 flex flex-col gap-2 p-3 justify-center">
              <div className="bg-slate-900 rounded-lg p-1 border border-slate-800" style={{ height: 130 }}>
                <Graph points={graphData.x} currentT={currentTime} label="y(t)" unit="m" color="#38bdf8"
                  yMin={yMin - yPad} yMax={yMax + yPad} />
              </div>
              <div className="bg-slate-900 rounded-lg p-1 border border-slate-800" style={{ height: 130 }}>
                <Graph points={graphData.v} currentT={currentTime} label="v(t)" unit="m/s" color="#818cf8"
                  yMin={v0 >= 0 ? 0 : v0 * 1.2} yMax={v0 >= 0 ? v0 * 1.2 : 0} />
              </div>
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
