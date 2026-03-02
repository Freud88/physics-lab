interface VectorArrowProps {
  /** Origin in SVG coordinates */
  x: number
  y: number
  /** Direction vector (will be normalized and scaled) */
  dx: number
  dy: number
  /** Display length in pixels */
  length: number
  color: string
  label?: string
  strokeWidth?: number
}

export default function VectorArrow({
  x,
  y,
  dx,
  dy,
  length,
  color,
  label,
  strokeWidth = 2,
}: VectorArrowProps) {
  const mag = Math.sqrt(dx * dx + dy * dy)
  if (mag < 1e-9 || length < 2) return null

  const nx = dx / mag
  const ny = dy / mag

  const x2 = x + nx * length
  const y2 = y + ny * length

  // Arrowhead
  const headLen = Math.min(12, length * 0.35)
  const angle = Math.atan2(ny, nx)
  const spread = 0.4 // radians
  const ax1 = x2 - headLen * Math.cos(angle - spread)
  const ay1 = y2 - headLen * Math.sin(angle - spread)
  const ax2 = x2 - headLen * Math.cos(angle + spread)
  const ay2 = y2 - headLen * Math.sin(angle + spread)

  // Label offset (perpendicular)
  const labelX = x + nx * length * 0.5 - ny * 14
  const labelY = y + ny * length * 0.5 + nx * 14

  return (
    <g>
      <line
        x1={x} y1={y} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <polygon
        points={`${x2},${y2} ${ax1},${ay1} ${ax2},${ay2}`}
        fill={color}
      />
      {label && (
        <text
          x={labelX}
          y={labelY}
          fill={color}
          fontSize="11"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {label}
        </text>
      )}
    </g>
  )
}
