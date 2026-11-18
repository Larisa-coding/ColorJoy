import { centroid } from './geometry';
import type { Pt, Region } from './types';

export const pointInPoly = (x: number, y: number, poly: Pt[]): boolean => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

export const interiorPoint = (points: Pt[]): { x: number; y: number } => {
  const center = centroid(points);
  if (pointInPoly(center.x, center.y, points)) return center;
  const box = points.reduce(
    (acc, [x, y]) => ({
      minX: Math.min(acc.minX, x),
      minY: Math.min(acc.minY, y),
      maxX: Math.max(acc.maxX, x),
      maxY: Math.max(acc.maxY, y),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );
  const mid = { x: (box.minX + box.maxX) / 2, y: (box.minY + box.maxY) / 2 };
  if (pointInPoly(mid.x, mid.y, points)) return mid;
  for (let i = 0; i < 48; i += 1) {
    const x = box.minX + ((i * 37) % 100) / 100 * (box.maxX - box.minX);
    const y = box.minY + ((i * 53) % 100) / 100 * (box.maxY - box.minY);
    if (pointInPoly(x, y, points)) return { x, y };
  }
  return center;
};

export const hitTest = (regions: Region[], x: number, y: number): Region | null => {
  let best: Region | null = null;
  for (const region of regions) {
    const { minX, minY, maxX, maxY } = region.bbox;
    if (x < minX || x > maxX || y < minY || y > maxY) continue;
    if (!pointInPoly(x, y, region.points)) continue;
    if (!best || region.area < best.area) best = region;
  }
  return best;
};
