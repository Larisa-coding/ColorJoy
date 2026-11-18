import type { Decor, Pt, Region, RegionInput } from './types';

export const round = (value: number): number => Math.round(value * 10) / 10;

export const polygonArea = (points: Pt[]): number => {
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
};

export const toPath = (points: Pt[]): string => {
  const [first, ...rest] = points;
  return `M ${first[0]} ${first[1]} L ${rest.map((point) => `${point[0]} ${point[1]}`).join(' L ')} Z`;
};

export const openPath = (points: Pt[]): string =>
  points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point[0]} ${point[1]}`).join(' ');

export const bboxOf = (points: Pt[]) => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of points) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY };
};

export const centroid = (points: Pt[]): { x: number; y: number } => {
  let x = 0;
  let y = 0;
  for (const point of points) {
    x += point[0];
    y += point[1];
  }
  return { x: x / points.length, y: y / points.length };
};

export const finalize = (inputs: RegionInput[]): Region[] => {
  const seen = new Set<string>();
  return inputs.map((input) => {
    if (seen.has(input.id)) throw new Error(`Повтор области ${input.id}`);
    seen.add(input.id);
    if (input.points.length < 3) throw new Error(`Мало точек у ${input.id}`);
    const points = input.points.map(([x, y]) => [round(x), round(y)] as Pt);
    const area = polygonArea(points);
    if (area < 12) throw new Error(`Слишком маленькая область ${input.id}`);
    return { id: input.id, name: input.name, points, d: toPath(points), area, bbox: bboxOf(points) };
  });
};

export const ellipse = (cx: number, cy: number, rx: number, ry: number, seg = 36): Pt[] => {
  const points: Pt[] = [];
  for (let i = 0; i < seg; i += 1) {
    const angle = (i / seg) * Math.PI * 2;
    points.push([cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry]);
  }
  return points;
};

export const circle = (cx: number, cy: number, r: number, seg = 36): Pt[] => ellipse(cx, cy, r, r, seg);

export const rect = (x: number, y: number, w: number, h: number): Pt[] => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];

export const roundRect = (x: number, y: number, w: number, h: number, r: number, seg = 5): Pt[] => {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  const points: Pt[] = [];
  const corners: Array<[number, number, number, number]> = [
    [x + w - radius, y + radius, -Math.PI / 2, 0],
    [x + w - radius, y + h - radius, 0, Math.PI / 2],
    [x + radius, y + h - radius, Math.PI / 2, Math.PI],
    [x + radius, y + radius, Math.PI, Math.PI * 1.5],
  ];
  if (radius <= 0) return rect(x, y, w, h);
  for (const [cx, cy, a0, a1] of corners) {
    for (let i = 0; i < seg; i += 1) {
      const t = a0 + ((a1 - a0) * i) / seg;
      points.push([cx + Math.cos(t) * radius, cy + Math.sin(t) * radius]);
    }
  }
  return points;
};

export const rotate = (points: Pt[], cx: number, cy: number, deg: number): Pt[] => {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return points.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
  });
};

export const shift = (points: Pt[], dx: number, dy: number, scale = 1, ox = 0, oy = 0): Pt[] =>
  points.map(([x, y]) => [ox + (x - ox) * scale + dx, oy + (y - oy) * scale + dy]);

export const ribbon = (line: Pt[], width: number): Pt[] => {
  if (line.length < 2) return line;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < line.length; i += 1) {
    const prev = line[Math.max(0, i - 1)];
    const next = line[Math.min(line.length - 1, i + 1)];
    let dx = next[0] - prev[0];
    let dy = next[1] - prev[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const ox = -dy * (width / 2);
    const oy = dx * (width / 2);
    left.push([line[i][0] + ox, line[i][1] + oy]);
    right.push([line[i][0] - ox, line[i][1] - oy]);
  }
  return [...left, ...right.reverse()];
};

export const arcBand = (cx: number, cy: number, r0: number, r1: number, a0: number, a1: number, seg = 22): Pt[] => {
  const outer: Pt[] = [];
  const inner: Pt[] = [];
  for (let i = 0; i <= seg; i += 1) {
    const angle = a0 + ((a1 - a0) * i) / seg;
    outer.push([cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1]);
    inner.push([cx + Math.cos(angle) * r0, cy + Math.sin(angle) * r0]);
  }
  return [...outer, ...inner.reverse()];
};

export const sampleQuad = (p0: Pt, p1: Pt, p2: Pt, seg = 12): Pt[] => {
  const points: Pt[] = [];
  for (let i = 0; i <= seg; i += 1) {
    const t = i / seg;
    const u = 1 - t;
    points.push([
      u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
      u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
    ]);
  }
  return points;
};

export const star = (cx: number, cy: number, outer: number, inner: number, n = 5): Pt[] => {
  const points: Pt[] = [];
  for (let i = 0; i < n * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / n;
    points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  return points;
};

export const heart = (cx: number, cy: number, size: number): Pt[] => {
  const points: Pt[] = [];
  for (let i = 0; i < 40; i += 1) {
    const t = (i / 40) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    points.push([cx + (x * size) / 17, cy - (y * size) / 17]);
  }
  return points;
};

export const cloud = (cx: number, cy: number, scale = 1): Pt[] => {
  const raw: Pt[] = [
    [-52, 8],
    [-36, -16],
    [-14, -6],
    [0, -24],
    [18, -8],
    [40, -16],
    [58, 6],
    [36, 22],
    [4, 24],
    [-28, 20],
  ];
  return raw.map(([x, y]) => [cx + x * scale, cy + y * scale]);
};

export const egg = (cx: number, cy: number, rx: number, ry: number): Pt[] => {
  const points: Pt[] = [];
  const seg = 40;
  for (let i = 0; i < seg; i += 1) {
    const t = (i / seg) * Math.PI * 2;
    const wobble = 1 + 0.18 * Math.sin(t);
    points.push([cx + Math.cos(t) * rx * (t > Math.PI ? 0.92 : 1), cy + Math.sin(t) * ry * wobble]);
  }
  return points;
};

export const inset = (points: Pt[], amount: number): Pt[] => {
  const c = centroid(points);
  return points.map(([x, y]) => {
    const dx = c.x - x;
    const dy = c.y - y;
    const len = Math.hypot(dx, dy) || 1;
    return [x + (dx / len) * amount, y + (dy / len) * amount];
  });
};

export const smile = (cx: number, cy: number, w: number): Decor => ({
  points: sampleQuad([cx - w, cy], [cx, cy + w * 0.95], [cx + w, cy]),
  width: Math.max(3, w * 0.18),
});

export const decorLine = (points: Pt[], width = 4): Decor => ({ points, width });
