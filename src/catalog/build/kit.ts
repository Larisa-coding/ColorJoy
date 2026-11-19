import { ellipse } from '../geometry';
import type { Pt } from '../types';
import type { Sketch } from './sketch';

/** Скругляет углы, не вылезая за фигуру. Так уши остаются ушами, а не петлями. */
export const curve = (pts: Pt[], passes = 2): Pt[] => {
  let current = pts;
  for (let pass = 0; pass < passes; pass += 1) {
    const next: Pt[] = [];
    for (let i = 0; i < current.length; i += 1) {
      const a = current[i];
      const b = current[(i + 1) % current.length];
      next.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      next.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    current = next;
  }
  return current;
};

export const part = (sketch: Sketch, id: string, name: string, pts: Pt[], passes = 1) => {
  sketch.add(id, name, passes <= 0 ? pts : curve(pts, 2));
};

export const disc = (sketch: Sketch, id: string, name: string, x: number, y: number, r: number) => {
  sketch.add(id, name, ellipse(x, y, r, r, 28));
};

export const eye = (sketch: Sketch, id: string, name: string, x: number, y: number, scale = 1) => {
  const rx = Math.max(11, 16 * scale);
  const ry = Math.max(12, 18 * scale);
  sketch.add(id, name, ellipse(x, y, rx, ry, 22));
  sketch.add(`${id}-p`, 'Зрачок', ellipse(x + rx * 0.12, y + ry * 0.08, rx * 0.42, ry * 0.46, 14));
};

export const nose = (sketch: Sketch, id: string, x: number, y: number, scale = 1) => {
  const s = 8 * scale;
  part(sketch, id, 'Нос', [
    [x - s, y - s * 0.3],
    [x, y - s],
    [x + s, y - s * 0.3],
    [x + s * 0.35, y + s * 0.7],
    [x - s * 0.35, y + s * 0.7],
  ], 1);
};

export const backdrop = (sketch: Sketch, kind: 'park' | 'sea' | 'space' | 'room' | 'snow' | 'plain' | 'night') => {
  const skyName = kind === 'room' ? 'Стена' : kind === 'sea' ? 'Небо' : 'Фон';
  sketch.add('sky', skyName, [[0, 0], [400, 0], [400, 400], [0, 400]]);
  if (kind === 'plain') return;
  if (kind === 'space' || kind === 'night') {
    part(sketch, 'moon', 'Луна', [
      [300, 70], [318, 48], [342, 52], [356, 74], [348, 98], [322, 104], [304, 90],
    ]);
    part(sketch, 'star-a', 'Звезда', [[70, 48], [78, 70], [100, 76], [78, 84], [70, 106], [62, 84], [40, 76], [62, 70]], 1);
    if (kind === 'night') {
      part(sketch, 'ground', 'Земля', [[0, 348], [90, 332], [180, 346], [280, 328], [400, 344], [400, 400], [0, 400]], 1);
    }
    return;
  }
  if (kind === 'sea') {
    part(sketch, 'water', 'Вода', [[0, 188], [70, 176], [150, 190], [240, 172], [320, 186], [400, 174], [400, 400], [0, 400]], 1);
    part(sketch, 'sand', 'Песок', [[0, 352], [120, 338], [220, 350], [320, 336], [400, 348], [400, 400], [0, 400]], 1);
    return;
  }
  if (kind === 'room') {
    part(sketch, 'floor', 'Пол', [[0, 368], [400, 368], [400, 400], [0, 400]], 0);
    part(sketch, 'window', 'Окно', [[300, 36], [368, 36], [368, 118], [300, 118]], 0);
    part(sketch, 'rug', 'Коврик', [[18, 348], [46, 334], [84, 346], [64, 368], [22, 372]], 1);
    return;
  }
  if (kind === 'snow') {
    part(sketch, 'ground', 'Снег', [[0, 346], [80, 328], [170, 342], [260, 324], [400, 340], [400, 400], [0, 400]], 1);
    part(sketch, 'flake-a', 'Снежинка', [[64, 52], [72, 70], [90, 74], [72, 82], [64, 100], [56, 82], [38, 74], [56, 70]], 1);
    return;
  }
  part(sketch, 'ground', 'Земля', [[0, 372], [90, 360], [180, 370], [270, 358], [360, 370], [400, 364], [400, 400], [0, 400]], 1);
  part(sketch, 'sun', 'Солнце', [[332, 58], [348, 42], [368, 50], [374, 70], [360, 86], [340, 84], [328, 70]], 1);
  part(sketch, 'cloud', 'Облако', [[48, 78], [62, 58], [86, 50], [108, 60], [128, 48], [150, 64], [142, 84], [110, 92], [78, 90], [54, 84]]);
};
