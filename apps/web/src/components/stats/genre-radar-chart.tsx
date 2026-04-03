"use client";

interface GenreRadarChartProps {
  genres: { genre: string; percentage: number }[];
}

export function GenreRadarChart({ genres }: GenreRadarChartProps) {
  const top6 = genres.slice(0, 6);
  const maxValue = Math.max(...top6.map((g) => g.percentage), 1);

  const cx = 150;
  const cy = 150;
  const radius = 120;
  const levels = 4;

  const angleStep = (2 * Math.PI) / top6.length;

  // Generate points for each genre
  const points = top6.map((g, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (g.percentage / maxValue) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      labelX: cx + (radius + 20) * Math.cos(angle),
      labelY: cy + (radius + 20) * Math.sin(angle),
      genre: g.genre,
      percentage: g.percentage,
    };
  });

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 300 300" className="h-full w-full">
      {/* Grid levels */}
      {Array.from({ length: levels }, (_, level) => {
        const r = (radius * (level + 1)) / levels;
        const gridPoints = top6
          .map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
          })
          .join(" ");
        return (
          <polygon
            key={level}
            points={gridPoints}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.15}
            strokeWidth={1}
          />
        );
      })}

      {/* Axis lines */}
      {top6.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + radius * Math.cos(angle)}
            y2={cy + radius * Math.sin(angle)}
            stroke="currentColor"
            strokeOpacity={0.15}
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygon */}
      {points.length > 2 && (
        <polygon
          points={polygonPoints}
          fill="var(--color-accent, #22c55e)"
          fillOpacity={0.2}
          stroke="var(--color-accent, #22c55e)"
          strokeWidth={2}
        />
      )}

      {/* Data points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4}
          fill="var(--color-accent, #22c55e)"
        />
      ))}

      {/* Labels */}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.labelX}
          y={p.labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-current text-[10px]"
        >
          {p.genre} ({p.percentage}%)
        </text>
      ))}
    </svg>
  );
}
