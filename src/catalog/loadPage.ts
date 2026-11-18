import { appConfig } from '@/config';
import { freePage } from './freePage';
import { getMeta, pageMetas } from './manifest';
import type { ColoringPage, Group, PageGeometry } from './types';

const loaders: Record<Group, () => Promise<{ geometry: Record<string, PageGeometry> }>> = {
  animals: () => import('./geom/animals'),
  nature: () => import('./geom/nature'),
  space: () => import('./geom/space'),
  transport: () => import('./geom/transport'),
  robots: () => import('./geom/robots'),
  fairy: () => import('./geom/fairy'),
  dinos: () => import('./geom/dinos'),
  jobs: () => import('./geom/jobs'),
  food: () => import('./geom/food'),
  holidays: () => import('./geom/holidays'),
  sports: () => import('./geom/sports'),
  cute: () => import('./geom/cute'),
};

const cache = new Map<string, ColoringPage>();
const pending = new Map<Group, Promise<void>>();

export const loadGroup = (group: Group): Promise<void> => {
  const existing = pending.get(group);
  if (existing) return existing;
  const job = loaders[group]().then((mod) => {
    for (const meta of pageMetas.filter((page) => page.group === group)) {
      const geometry = mod.geometry[meta.id];
      if (!geometry) throw new Error(`Нет геометрии ${meta.id}`);
      cache.set(meta.id, { ...meta, ...geometry, author: appConfig.name, license: 'original' });
    }
  });
  pending.set(group, job);
  return job;
};

export const loadPage = async (id: string): Promise<ColoringPage> => {
  if (id === freePage.id) return freePage;
  const cached = cache.get(id);
  if (cached) return cached;
  const meta = getMeta(id);
  if (!meta) throw new Error('Раскраска не найдена');
  await loadGroup(meta.group);
  const page = cache.get(id);
  if (!page) throw new Error('Раскраска не найдена');
  return page;
};

export const peekPage = (id: string): ColoringPage | undefined => cache.get(id);
