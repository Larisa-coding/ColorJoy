import { describe, expect, it } from 'vitest';
import { collections } from '../src/catalog/collections';
import { palette } from '../src/catalog/colors';
import { geometry as animals } from '../src/catalog/geom/animals';
import { geometry as cute } from '../src/catalog/geom/cute';
import { geometry as dinos } from '../src/catalog/geom/dinos';
import { geometry as fairy } from '../src/catalog/geom/fairy';
import { geometry as food } from '../src/catalog/geom/food';
import { geometry as holidays } from '../src/catalog/geom/holidays';
import { geometry as jobs } from '../src/catalog/geom/jobs';
import { geometry as nature } from '../src/catalog/geom/nature';
import { geometry as robots } from '../src/catalog/geom/robots';
import { geometry as space } from '../src/catalog/geom/space';
import { geometry as sports } from '../src/catalog/geom/sports';
import { geometry as transport } from '../src/catalog/geom/transport';
import { hitTest, interiorPoint, pointInPoly } from '../src/catalog/hit';
import { pageMetas } from '../src/catalog/manifest';
import type { PageGeometry } from '../src/catalog/types';

const all = {
  ...animals,
  ...nature,
  ...space,
  ...transport,
  ...robots,
  ...fairy,
  ...dinos,
  ...jobs,
  ...food,
  ...holidays,
  ...sports,
  ...cute,
};

describe('каталог', () => {
  it('содержит не меньше 100 оригинальных раскрасок и 60 цветов', () => {
    expect(pageMetas.length).toBeGreaterThanOrEqual(100);
    expect(Object.keys(all).length).toBe(pageMetas.length);
    expect(palette.length).toBeGreaterThanOrEqual(60);
    expect(new Set(pageMetas.map((page) => page.id)).size).toBe(pageMetas.length);
  });

  it('у каждой раскраски замкнутые области и попадание внутрь', () => {
    for (const meta of pageMetas) {
      const page = all[meta.id] as PageGeometry | undefined;
      expect(page, meta.id).toBeTruthy();
      expect(page!.regions.length, meta.id).toBeGreaterThanOrEqual(6);
      const ids = new Set<string>();
      for (const region of page!.regions) {
        expect(ids.has(region.id), `${meta.id}:${region.id}`).toBe(false);
        ids.add(region.id);
        expect(region.d.endsWith('Z'), region.id).toBe(true);
        expect(region.area).toBeGreaterThan(12);
        const point = interiorPoint(region.points);
        expect(pointInPoly(point.x, point.y, region.points), `${meta.id}:${region.id}`).toBe(true);
        const hit = hitTest(page!.regions, point.x, point.y);
        expect(hit, `${meta.id}:${region.id}`).toBeTruthy();
        expect(hit!.area).toBeLessThanOrEqual(region.area + 0.05);
      }
      expect(collections.some((item) => item.id === meta.collectionId && item.status === 'ready')).toBe(true);
    }
  });

  it('лицензионные коллекции без чужих картинок', () => {
    const soon = collections.filter((item) => item.status === 'soon');
    expect(soon.length).toBeGreaterThanOrEqual(8);
    for (const item of soon) {
      expect(pageMetas.some((page) => page.collectionId === item.id)).toBe(false);
    }
  });
});
