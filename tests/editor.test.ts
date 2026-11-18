/// <reference types="node" />
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { palette } from '../src/catalog/colors';
import { hitTest } from '../src/catalog/hit';
import { geometry as animals } from '../src/catalog/geom/animals';
import { buildTopology } from '../src/catalog/topology';
import { OpHistory } from '../src/editor/history';
import { sampleSegment } from '../src/editor/sample';
import { artFromScreen } from '../src/editor/viewport';
import { isPayload } from '../src/storage/types';

describe('кисть и история', () => {
  it('не оставляет разрывов при быстром движении', () => {
    const points = sampleSegment({ x: 0, y: 0 }, { x: 100, y: 0 }, 5);
    expect(points[0]).toEqual({ x: 5, y: 0 });
    expect(points.at(-1)).toEqual({ x: 100, y: 0 });
    for (let i = 1; i < points.length; i += 1) {
      expect(points[i].x - points[i - 1].x).toBeLessThanOrEqual(5.01);
    }
  });

  it('отменяет и возвращает действие', () => {
    const history = new OpHistory<string>();
    history.push('мазок');
    history.push('заливка');
    history.undo();
    expect(history.applied()).toEqual(['мазок']);
    history.redo();
    expect(history.applied()).toEqual(['мазок', 'заливка']);
    history.undo();
    history.push('ластик');
    expect(history.applied()).toEqual(['мазок', 'ластик']);
    expect(history.canRedo).toBe(false);
  });

  it('переводит координаты с учётом масштаба', () => {
    expect(artFromScreen(200, 200, 0, 0, 0, 0, 1, 400)).toEqual({ x: 200, y: 200 });
    expect(artFromScreen(200, 100, 0, 0, 0, 0, 2, 400)).toEqual({ x: 100, y: 50 });
  });

  it('заливка попадает только во внутреннюю область', () => {
    const page = animals['cat-mur'];
    const head = page.regions.find((region) => region.id === 'head');
    expect(head).toBeTruthy();
    const eye = page.regions.find((region) => region.id === 'eye-l' || region.id === 'eye-r');
    expect(eye).toBeTruthy();
    const hit = hitTest(page.regions, eye!.bbox.minX + 2, (eye!.bbox.minY + eye!.bbox.maxY) / 2);
    expect(hit?.id).not.toBe('head');
    expect(hit?.id).not.toBe('sky');
    const topology = buildTopology(page.regions);
    expect(topology.parent.get('sky')).toBeNull();
    expect(topology.children.get('head')?.length).toBeGreaterThan(0);
  });

  it('не принимает повреждённое сохранение', () => {
    expect(isPayload(null)).toBe(false);
    expect(isPayload({ schemaVersion: 1, id: 'a', ops: [] })).toBe(true);
    expect(isPayload({ schemaVersion: 2, id: 'a', ops: [] })).toBe(false);
    expect(palette.length).toBeGreaterThanOrEqual(60);
  });

  it('не тянет картинки и ссылки из интернета', () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.(ts|tsx|css|svg|html|json)$/.test(name)) files.push(full);
      }
    };
    walk('src');
    walk('public');
    const text = files.map((file) => readFileSync(file, 'utf8')).join('\n').replaceAll('http://www.w3.org/2000/svg', '');
    expect(text).not.toMatch(/https?:\/\//);
  });
});
