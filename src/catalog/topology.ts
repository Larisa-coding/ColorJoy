import { interiorPoint, pointInPoly } from './hit';
import type { Region } from './types';

export type Topology = {
  parent: Map<string, string | null>;
  children: Map<string, string[]>;
};

export const buildTopology = (regions: Region[]): Topology => {
  const parent = new Map<string, string | null>();
  for (const region of regions) {
    const point = interiorPoint(region.points);
    let best: Region | null = null;
    for (const other of regions) {
      if (other.id === region.id || other.area <= region.area) continue;
      if (!pointInPoly(point.x, point.y, other.points)) continue;
      if (!best || other.area < best.area) best = other;
    }
    parent.set(region.id, best?.id ?? null);
  }
  const children = new Map<string, string[]>();
  for (const region of regions) children.set(region.id, []);
  for (const [id, pid] of parent) {
    if (!pid) continue;
    children.get(pid)?.push(id);
  }
  return { parent, children };
};
