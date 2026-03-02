import { Play, Pause, RotateCcw } from 'lucide-react'

interface TimeBarProps {
  currentTime: number
  duration: number
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onReset: () => void
  onSeek: (t: number) => void
}

export default function TimeBar({
  currentTime,
  duration,
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onSeek,
}: TimeBarProps) {
  const progress = duration > 0 ? currentTime / duration : 0

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    onSeek(parseFloat(e.target.value))
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-t border-slate-800">
      {/* Buttons */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-500 hover:bg-sky-400 text-white transition-colors flex-shrink-0"
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>
      <button
        onClick={onReset}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors flex-shrink-0"
      >
        <RotateCcw size={14} />
      </button>

      {/* Scrub bar */}
      <div className="flex-1 relative flex items-center">
        <input
          type="range"
          min={0}
          max={duration}
          step={0.01}
          value={currentTime}
          onChange={handleSliderChange}
          className="w-full h-1.5 accent-sky-500 cursor-pointer"
          style={{
            background: `linear-gradient(to right, #0ea5e9 ${progress * 100}%, #334155 ${progress * 100}%)`,
          }}
        />
      </div>

      {/* Time display */}
      <span className="text-xs text-slate-400 font-mono flex-shrink-0 w-20 text-right">
        {currentTime.toFixed(2)}s / {duration.toFixed(1)}s
      </span>
    </div>
  )
}
