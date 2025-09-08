import React from 'react';

interface RadarChartProps {
  labels: string[];
  values: number[];
  maxValue?: number;
  size?: number;
  levels?: number;
  fillColor?: string;
  strokeColor?: string;
}

// Lightweight, dependency-free radar chart using SVG
export const RadarChart: React.FC<RadarChartProps> = ({
  labels,
  values,
  maxValue = 255,
  size = 320,
  levels = 5,
  fillColor = 'rgba(239,68,68,0.35)', // red-500 @ ~35%
  strokeColor = 'rgba(239,68,68,0.8)',
}) => {
  const count = Math.min(labels.length, values.length);
  const cx = size / 2;
  const cy = size / 2;
  const padding = 28;
  const R = size / 2 - padding;

  const angleFor = (i: number) => (Math.PI * 2 * i) / count - Math.PI / 2;
  const pointFor = (i: number, vRatio: number) => {
    const angle = angleFor(i);
    const r = R * vRatio;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const ratio = (v: number) => Math.max(0, Math.min(1, v / maxValue));

  const polygonPoints = Array.from({ length: count }, (_, i) => {
    const { x, y } = pointFor(i, ratio(values[i]));
    return `${x},${y}`;
  }).join(' ');

  const gridLevels = Array.from({ length: levels }, (_, i) => (i + 1) / levels);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Radar chart"
    >
      {/* Grid circles/polygons */}
      {gridLevels.map((lv, idx) => (
        <polygon
          key={idx}
          points={Array.from({ length: count }, (_, i) => {
            const { x, y } = pointFor(i, lv);
            return `${x},${y}`;
          }).join(' ')}
          fill="none"
          stroke="rgba(148,163,184,0.4)"
          strokeWidth={1}
        />
      ))}

      {/* Axes */}
      {Array.from({ length: count }, (_, i) => {
        const { x, y } = pointFor(i, 1);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="rgba(148,163,184,0.5)"
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygon */}
      <polygon points={polygonPoints} fill={fillColor} stroke={strokeColor} strokeWidth={2} />

      {/* Labels */}
      {labels.map((label, i) => {
        const { x, y } = pointFor(i, 1.08); // a bit outside
        // Adjust text anchor based on quadrant
        const angle = angleFor(i);
        const anchor =
          Math.cos(angle) > 0.25 ? 'start' : Math.cos(angle) < -0.25 ? 'end' : 'middle';
        const dy = Math.sin(angle) > 0.25 ? '1em' : Math.sin(angle) < -0.25 ? '-0.3em' : '0.35em';
        return (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="central"
            style={{ fontSize: 12, fill: 'rgb(226,232,240)' }}
            dy={dy}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
};

export default RadarChart;
