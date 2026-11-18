export type Point = { x: number; y: number };

export const sampleSegment = (from: Point, to: Point, spacing: number): Point[] => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return [];
  const steps = Math.max(1, Math.ceil(dist / Math.max(spacing, 0.2)));
  const points: Point[] = [];
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    points.push({ x: from.x + dx * t, y: from.y + dy * t });
  }
  return points;
};

export const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
