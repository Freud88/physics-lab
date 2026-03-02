import { useState, useEffect, useRef, useCallback } from 'react'
import VectorArrow from '../../components/VectorArrow'
import Graph, { GraphPoint } from '../../components/Graph'
import TimeBar from '../../components/TimeBar'

function buildPoints(r: number, T: number, duration: number, steps = 400) {
  const omega = (2 * Math.PI) / T
  const x: GraphPoint[] = []
  const y: GraphPoint[] = []
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * duration
    x.push({ t, y: r * Math.cos(omega * t) })
    y.push({ t, y: r * Math.sin(omega * t) })
  }
  return { x, y }
}

export default function MCU() {
  const [r, setR] = useState(5)
  const [T, setT] = useState(4)
  const [duration, setDuration] = useState(12)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)

  const omega = (2 * Math.PI) / T
  const f = 1 / T
  const v = r * omega
  const ac = r * omega * omega

  const theta = omega * currentTime
  const bx = r * Math.cos(theta)
  const by = r * Math.sin(theta)

  const graphData = buildPoints(r, T, duration)

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
  const svgW = 300, svgH = 300
  const cx = svgW / 2, cy = svgH / 2
  const scale = Math.min((svgW * 0.38) / r, (svgH * 0.38) / r)
  const toSvgX = (x: number) => cx + x * scale
  const toSvgY = (y: number) => cy - y * scale

  const bodySvgX = toSvgX(bx)
  const bodySvgY = toSvgY(by)

  const vTangX = -Math.sin(theta)
  const vTangY = Math.cos(theta)
  const velLen = Math.min(90, v * 15)

  const acDirX = -Math.cos(theta)
  const acDirY = -Math.sin(theta)
  const acLen = Math.min(70, ac * 12)

  // Traccia percorso (arco già percorso)
  const trailPoints: string[] = []
  const trailSteps = 60
  for (let i = 0; i <= trailSteps; i++) {
    const t = (i / trailSteps) * currentTime
    const th = omega * t
    const tx = toSvgX(r * Math.cos(th))
    const ty = toSvgY(r * Math.sin(th))
    trailPoints.push(`${tx},${ty}`)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 min-h-0">
        {/* Left: controls */}
        <aside className="w-56 flex-shrink-0 border-r border-slate-800 bg-slate-900/50 p-4 overflow-y-auto">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Parametri MCU</h3>
          <div className="space-y-5">
            <SliderInput label="Raggio r" unit="m" min={0.1} max={100} step={0.5} value={r}
              onChange={v => { setR(v); handleReset() }} />
            <SliderInput label="Periodo T" unit="s" min={0.1} max={60} step={0.1} value={T}
              onChange={v => { setT(v); handleReset() }} />
            <SliderInput label="Durata" unit="s" min={1} max={120} step={1} value={duration}
              onChange={v => { setDuration(v); handleReset() }} />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Valori attuali</h4>
            <InfoRow label="ω" value={`${omega.toFixed(3)} rad/s`} />
            <InfoRow label="f" value={`${f.toFixed(3)} Hz`} />
            <InfoRow label="|v|" value={`${v.toFixed(3)} m/s`} color="text-sky-400" />
            <InfoRow label="|aₙ|" value={`${ac.toFixed(3)} m/s²`} color="text-rose-400" />
            <InfoRow label="θ" value={`${((theta * 180) / Math.PI % 360).toFixed(1)}°`} />
            <InfoRow label="t" value={`${currentTime.toFixed(2)} s`} />
            <InfoRow label="giri" value={`${(currentTime / T).toFixed(2)}`} />
          </div>

          <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 space-y-1">
            <p className="text-xs text-slate-500 font-mono">ω = 2π/T</p>
            <p className="text-xs text-slate-500 font-mono">v = r·ω</p>
            <p className="text-xs text-slate-500 font-mono">aₙ = v²/r = r·ω²</p>
          </div>
        </aside>

        {/* Right: scene + graphs */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Scena circolare */}
            <div className="flex-none bg-slate-950 flex items-center justify-center p-2" style={{ width: 220 }}>
              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="h-full" style={{ maxHeight: 300 }} preserveAspectRatio="xMidYMid meet">
                {/* Assi */}
                <line x1={cx} y1={20} x2={cx} y2={svgH - 20} stroke="#1e293b" strokeWidth={1} />
                <line x1={20} y1={cy} x2={svgW - 20} y2={cy} stroke="#1e293b" strokeWidth={1} />

                {/* Orbita */}
                <circle cx={cx} cy={cy} r={r * scale} fill="none" stroke="#1e3a5f" strokeWidth={2} />

                {/* Traccia percorso */}
                {currentTime > 0.05 && (
                  <polyline
                    points={trailPoints.join(' ')}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth={1.5}
                    strokeOpacity={0.35}
                  />
                )}

                {/* Raggio */}
                <line x1={cx} y1={cy} x2={bodySvgX} y2={bodySvgY} stroke="#475569" strokeWidth={1} strokeDasharray="3 3" />
                <text x={(cx + bodySvgX) / 2 + 4} y={(cy + bodySvgY) / 2 - 4} fill="#64748b" fontSize="10">r</text>

                {/* Centro */}
                <circle cx={cx} cy={cy} r={4} fill="#475569" />

                {/* Accelerazione centripeta (rosa, verso centro) */}
                <VectorArrow
                  x={bodySvgX} y={bodySvgY}
                  dx={acDirX} dy={-acDirY}
                  length={acLen}
                  color="#f43f5e"
                  label="aₙ"
                  strokeWidth={2.5}
                />

                {/* Velocità tangenziale (blu) */}
                <VectorArrow
                  x={bodySvgX} y={bodySvgY}
                  dx={vTangX} dy={-vTangY}
                  length={velLen}
                  color="#38bdf8"
                  label="v"
                  strokeWidth={2.5}
                />

                {/* Corpo — scatola */}
                <rect
                  x={bodySvgX - 10} y={bodySvgY - 10}
                  width={20} height={20}
                  rx={3}
                  fill="#0369a1" stroke="#38bdf8" strokeWidth={1.5}
                />
              </svg>
            </div>

            {/* Grafici */}
            <div className="flex-1 flex flex-col gap-2 p-3 justify-center">
              <div className="bg-slate-900 rounded-lg p-1 border border-slate-800" style={{ height: 130 }}>
                <Graph points={graphData.x} currentT={currentTime} label="x(t) = r·cos(ωt)" unit="m" color="#38bdf8"
                  yMin={-r * 1.15} yMax={r * 1.15} />
              </div>
              <div className="bg-slate-900 rounded-lg p-1 border border-slate-800" style={{ height: 130 }}>
                <Graph points={graphData.y} currentT={currentTime} label="y(t) = r·sin(ωt)" unit="m" color="#a78bfa"
                  yMin={-r * 1.15} yMax={r * 1.15} />
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
