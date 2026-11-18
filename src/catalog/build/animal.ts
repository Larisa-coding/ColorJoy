import { circle, decorLine, ellipse, inset, polygonArea, ribbon, rotate, sampleQuad, smile, star } from '../geometry';
import type { PageMeta, Pt } from '../types';
import { Sketch } from './sketch';

type Pose = 'front' | 'side' | 'sleep' | 'run';
type Ear = 'pointy' | 'round' | 'floppy' | 'bunny' | 'none';
type Tail = 'curl' | 'straight' | 'puff' | 'big' | 'short' | 'none';
export type DressKind = 'plain' | 'park' | 'sea' | 'space' | 'room' | 'snow' | 'night';
export type PropKind = 'none' | 'yarn' | 'carrot' | 'bamboo' | 'honey' | 'apple' | 'ball' | 'flower' | 'egg' | 'fish' | 'star';

export type AnimalOpts = {
  pose?: Pose;
  ear?: Ear;
  tail?: Tail;
  nose?: 'dot' | 'triangle' | 'snout';
  head?: number;
  bodyRx?: number;
  bodyRy?: number;
  cheeks?: boolean;
  whiskers?: boolean;
  belly?: boolean;
  paws?: boolean;
  simple?: boolean;
  dress?: DressKind;
  prop?: PropKind;
  extras?: Array<'spots' | 'horn' | 'mane' | 'trunk' | 'wings' | 'shell' | 'neck' | 'fluff' | 'spikes' | 'patches' | 'ossicones' | 'bow'>;
  ox?: number;
  oy?: number;
  sc?: number;
  prefix?: string;
  facing?: 1 | -1;
  dressHere?: boolean;
};

const earPoints = (ear: Ear, side: -1 | 1, hx: number, hy: number, hr: number): Pt[] => {
  if (ear === 'bunny') {
    return rotate(ellipse(hx + side * hr * 0.42, hy - hr * 1.05, hr * 0.22, hr * 0.92), hx + side * hr * 0.42, hy - hr * 0.2, side * -8);
  }
  if (ear === 'floppy') {
    return rotate(ellipse(hx + side * hr * 0.95, hy + hr * 0.15, hr * 0.34, hr * 0.62), hx + side * hr * 0.45, hy - hr * 0.1, side * 28);
  }
  if (ear === 'round') {
    return ellipse(hx + side * hr * 0.62, hy - hr * 0.72, hr * 0.32, hr * 0.32);
  }
  if (ear === 'pointy') {
    return [
      [hx + side * hr * 0.18, hy - hr * 0.45],
      [hx + side * hr * 0.42, hy - hr * 1.35],
      [hx + side * hr * 0.95, hy - hr * 0.28],
    ];
  }
  return [];
};

const tailLine = (tail: Tail, bx: number, by: number, brx: number): Pt[] => {
  if (tail === 'curl') {
    const pts: Pt[] = [];
    for (let i = 0; i <= 14; i += 1) {
      const t = i / 14;
      const ang = Math.PI * 0.2 + t * Math.PI * 1.35;
      pts.push([bx - brx * 0.15 - t * 24 + Math.cos(ang) * (26 + t * 10), by - 30 + Math.sin(ang) * 24]);
    }
    return pts;
  }
  if (tail === 'straight') {
    return [
      [bx - brx + 8, by],
      [bx - brx - 36, by - 28],
      [bx - brx - 70, by - 8],
    ];
  }
  if (tail === 'big') {
    const pts: Pt[] = [];
    for (let i = 0; i <= 12; i += 1) {
      const t = i / 12;
      pts.push([bx - brx + 6 - t * 78, by - 10 - Math.sin(t * Math.PI) * 56]);
    }
    return pts;
  }
  return [
    [bx - brx + 10, by + 8],
    [bx - brx - 28, by + 4],
  ];
};

export const addAnimal = (sketch: Sketch, opts: AnimalOpts): void => {
  const pose = opts.pose ?? 'front';
  const ear = opts.ear ?? 'pointy';
  const tail = opts.tail ?? 'curl';
  const prefix = opts.prefix ? `${opts.prefix}-` : '';
  const id = (name: string) => `${prefix}${name}`;
  const sc = opts.sc ?? 1;
  const facing = opts.facing ?? 1;
  const ox = opts.ox ?? 0;
  const oy = opts.oy ?? 0;
  const mapPoint = (x: number, y: number): Pt => {
    const px = facing === -1 ? 400 - x : x;
    return [200 + (px - 200) * sc + ox, 230 + (y - 230) * sc + oy];
  };
  const map = (points: Pt[]) => points.map(([x, y]) => mapPoint(x, y));
  const put = (name: string, title: string, points: Pt[]) => {
    const mapped = map(points);
    if (mapped.length >= 3 && polygonArea(mapped) >= 18) sketch.add(id(name), title, mapped);
  };

  const neck = opts.extras?.includes('neck') ?? false;
  const hx = pose === 'side' ? 132 : pose === 'sleep' ? 118 : pose === 'run' ? 168 : 200;
  let hy = pose === 'sleep' ? 214 : neck ? 86 : pose === 'side' ? 168 : pose === 'run' ? 150 : 150;
  let hr = (pose === 'side' || pose === 'sleep' ? 46 : 60) * (opts.head ?? 1);
  const bx = pose === 'side' ? 230 : pose === 'run' ? 214 : 200;
  const by = pose === 'sleep' ? 246 : 252;
  const brx = (pose === 'side' || pose === 'sleep' || pose === 'run' ? 92 : 74) * (opts.bodyRx ?? 1);
  const bry = (pose === 'sleep' ? 42 : pose === 'side' || pose === 'run' ? 48 : 64) * (opts.bodyRy ?? 1);
  if (pose === 'run') {
    hy = 156;
    hr = 48 * (opts.head ?? 1);
  }

  if (opts.extras?.includes('shell')) put('shell', 'Панцирь', ellipse(bx, by + 6, brx + 18, bry + 8));
  if (opts.extras?.includes('wings')) {
    put('wing-l', 'Левое крыло', rotate(ellipse(bx - brx * 0.2, by - 10, 70, 34), bx, by, -30));
    put('wing-r', 'Правое крыло', rotate(ellipse(bx + brx * 0.2, by - 10, 70, 34), bx, by, 30));
  }
  if (tail !== 'none' && tail !== 'puff') put('tail', 'Хвост', ribbon(tailLine(tail, bx, by, brx), tail === 'big' ? 26 : tail === 'short' ? 12 : 16));
  if (tail === 'puff') put('tail', 'Хвостик', circle(bx - brx * 0.15, by + bry * 0.15, 16));

  let body = ellipse(bx, by, brx, bry);
  if (pose === 'run') body = rotate(body, bx, by, -16);
  put('body', 'Тело', body);
  if (opts.belly !== false && pose === 'front') put('belly', 'Живот', ellipse(bx, by + 12, brx * 0.48, bry * 0.62));
  if (neck) put('neck', 'Шея', ellipse(200, 150, 22, 62));

  if (opts.extras?.includes('fluff')) {
    for (let i = 0; i < 7; i += 1) {
      const ang = -Math.PI + (i / 6) * Math.PI;
      put(`fluff-${i}`, 'Шерсть', circle(bx + Math.cos(ang) * (brx + 8), by + Math.sin(ang) * (bry * 0.45) - 6, 16));
    }
  }
  if (opts.extras?.includes('spikes')) {
    for (let i = 0; i < 6; i += 1) {
      const x = bx - brx * 0.7 + i * brx * 0.28;
      put(`spike-${i}`, 'Иголка', [
        [x, by - 8],
        [x + 8, by - 36],
        [x + 16, by - 6],
      ]);
    }
  }
  if (opts.extras?.includes('spots')) {
    put('spot-a', 'Пятно', ellipse(bx - 18, by - 8, 14, 11));
    put('spot-b', 'Пятно', ellipse(bx + 20, by + 10, 12, 10));
    put('spot-c', 'Пятно', ellipse(bx + 4, by + 24, 10, 8));
    if (!opts.simple) put('spot-d', 'Пятно', ellipse(bx - 24, by + 18, 9, 7));
  }

  put('head', 'Голова', circle(hx, hy, hr));
  if (opts.extras?.includes('mane')) {
    for (let i = 0; i < 8; i += 1) {
      const ang = (i / 8) * Math.PI * 2;
      put(`mane-${i}`, 'Грива', circle(hx + Math.cos(ang) * hr * 0.92, hy + Math.sin(ang) * hr * 0.92, hr * 0.28));
    }
  }
  if (opts.extras?.includes('patches')) {
    put('patch-l', 'Пятно у глаза', ellipse(hx - hr * 0.36, hy + 2, hr * 0.28, hr * 0.22));
    put('patch-r', 'Пятно у глаза', ellipse(hx + hr * 0.36, hy + 2, hr * 0.28, hr * 0.22));
  }

  const ears: Array<-1 | 1> = pose === 'side' || pose === 'sleep' ? [-1] : [-1, 1];
  if (ear !== 'none') {
    for (const side of ears) {
      const label = side < 0 ? 'Левое ухо' : 'Правое ухо';
      const key = side < 0 ? 'ear-l' : 'ear-r';
      const pts = earPoints(ear, side, hx, hy, hr);
      put(key, label, pts);
      if (!opts.simple && pts.length) put(`${key}-in`, 'Внутреннее ухо', inset(pts, Math.min(10, hr * 0.18)));
    }
  }
  if (opts.extras?.includes('horn')) {
    put('horn', 'Рог', [
      [hx - 10, hy - hr * 0.72],
      [hx, hy - hr * 1.45],
      [hx + 10, hy - hr * 0.72],
    ]);
  }
  if (opts.extras?.includes('ossicones')) {
    put('ossi-l', 'Рожок', ellipse(hx - 16, hy - hr - 8, 5, 14));
    put('ossi-r', 'Рожок', ellipse(hx + 16, hy - hr - 8, 5, 14));
  }
  if (opts.extras?.includes('bow')) {
    put('bow-l', 'Бант', rotate(ellipse(hx + hr * 0.7, hy - hr * 0.2, 16, 10), hx + hr * 0.7, hy - hr * 0.2, -30));
    put('bow-r', 'Бант', rotate(ellipse(hx + hr * 0.95, hy + 4, 16, 10), hx + hr * 0.95, hy + 4, 24));
    put('bow-k', 'Узел', circle(hx + hr * 0.82, hy - 2, 7));
  }

  const eyeY = hy + hr * 0.08;
  const eyeDx = hr * 0.34;
  const eyeR = hr * 0.16;
  if (pose !== 'sleep') {
    const eyeSides: Array<-1 | 1> = pose === 'side' ? [facing === -1 ? 1 : -1] : [-1, 1];
    for (const side of eyeSides) {
      const ex = hx + side * eyeDx;
      put(side < 0 ? 'eye-l' : 'eye-r', side < 0 ? 'Левый глаз' : 'Правый глаз', circle(ex, eyeY, eyeR));
      if (!opts.simple) put(side < 0 ? 'pupil-l' : 'pupil-r', 'Зрачок', circle(ex + side * 1.5, eyeY + 1, eyeR * 0.48));
    }
  } else {
    sketch.decor(map(sampleQuad([hx - 16, eyeY], [hx - 8, eyeY + 6], [hx, eyeY])), 3);
    sketch.decor(map(sampleQuad([hx + 4, eyeY], [hx + 12, eyeY + 6], [hx + 20, eyeY])), 3);
    sketch.decor(map(sampleQuad([hx + hr + 16, hy - 20], [hx + hr + 28, hy - 36], [hx + hr + 18, hy - 48])), 3);
  }

  if (opts.nose === 'snout') put('snout', 'Носик', ellipse(hx + (pose === 'side' ? -hr * 0.7 : 0), hy + hr * 0.42, hr * 0.34, hr * 0.24));
  if (opts.nose === 'triangle') {
    const nx = hx + (pose === 'side' ? -hr * 0.55 : 0);
    put('nose', 'Нос', [
      [nx - 7, hy + hr * 0.28],
      [nx + 7, hy + hr * 0.28],
      [nx, hy + hr * 0.48],
    ]);
  } else if (opts.nose !== 'snout') {
    put('nose', 'Нос', circle(hx + (pose === 'side' ? -hr * 0.62 : 0), hy + hr * 0.32, Math.max(5, hr * 0.1)));
  }
  if (opts.cheeks && pose !== 'sleep') {
    put('cheek-l', 'Щека', circle(hx - hr * 0.55, hy + hr * 0.28, hr * 0.16));
    if (pose === 'front') put('cheek-r', 'Щека', circle(hx + hr * 0.55, hy + hr * 0.28, hr * 0.16));
  }
  if (opts.extras?.includes('trunk')) {
    const tipX = hx + (pose === 'side' ? -hr * 0.2 : 0);
    put(
      'trunk',
      'Хобот',
      ribbon(
        [
          [tipX, hy + hr * 0.7],
          [tipX - 10, hy + hr * 1.2],
          [tipX - 24, hy + hr * 1.7],
          [tipX - 8, hy + hr * 2.05],
        ],
        16,
      ),
    );
  }

  if (opts.paws !== false && pose !== 'sleep') {
    if (pose === 'front') {
      put('paw-l', 'Левая лапа', ellipse(bx - brx * 0.42, by + bry * 0.78, brx * 0.28, bry * 0.28));
      put('paw-r', 'Правая лапа', ellipse(bx + brx * 0.42, by + bry * 0.78, brx * 0.28, bry * 0.28));
    } else {
      put('paw-a', 'Лапа', ellipse(bx - 20, by + bry * 0.85, 16, 12));
      put('paw-b', 'Лапа', ellipse(bx + 34, by + bry * 0.9, 16, 12));
      if (pose === 'run') {
        put('paw-c', 'Лапа', ellipse(bx - 48, by + 8, 14, 10));
        put('paw-d', 'Лапа', ellipse(bx + 58, by + 6, 14, 10));
      }
    }
  }

  const smileAt = mapPoint(hx + (pose === 'side' ? -hr * 0.2 : 0), hy + hr * 0.55);
  if (pose !== 'sleep') sketch.decor(smile(smileAt[0], smileAt[1], hr * 0.22 * sc).points, 3.5);
  if (opts.whiskers && pose !== 'sleep') {
    const base = mapPoint(hx, hy + hr * 0.34);
    const w = 34 * sc;
    sketch.decor(decorLine([mapPoint(hx - 8, hy + hr * 0.34), [base[0] - w, base[1] - 6]], 3).points, 3);
    sketch.decor(decorLine([mapPoint(hx - 8, hy + hr * 0.42), [base[0] - w, base[1] + 8]], 3).points, 3);
    if (pose === 'front') {
      sketch.decor(decorLine([mapPoint(hx + 8, hy + hr * 0.34), [base[0] + w, base[1] - 6]], 3).points, 3);
      sketch.decor(decorLine([mapPoint(hx + 8, hy + hr * 0.42), [base[0] + w, base[1] + 8]], 3).points, 3);
    }
  }

  const propAt = mapPoint(pose === 'side' ? bx + 20 : bx + brx + 24, by + 20);
  if (opts.prop === 'yarn') {
    put('yarn', 'Клубок', circle(propAt[0], propAt[1], 28 * sc));
    put('yarn-in', 'Нитка', circle(propAt[0], propAt[1], 12 * sc));
  } else if (opts.prop === 'carrot') {
    put('carrot', 'Морковка', [
      [propAt[0] - 8, propAt[1] - 20],
      [propAt[0] + 8, propAt[1] - 16],
      [propAt[0], propAt[1] + 28],
    ]);
    put('carrot-top', 'Ботва', ellipse(propAt[0], propAt[1] - 28, 10, 8));
  } else if (opts.prop === 'bamboo') {
    put('bamboo-a', 'Бамбук', ellipse(propAt[0] - 10, propAt[1], 8, 36));
    put('bamboo-b', 'Бамбук', ellipse(propAt[0] + 12, propAt[1] + 6, 8, 32));
  } else if (opts.prop === 'honey') {
    put('pot', 'Горшочек', ellipse(propAt[0], propAt[1] + 8, 22, 18));
    put('honey', 'Мёд', ellipse(propAt[0], propAt[1] - 8, 16, 8));
  } else if (opts.prop === 'apple') {
    put('apple', 'Яблоко', circle(propAt[0], propAt[1], 16));
    put('apple-leaf', 'Листик', ellipse(propAt[0] + 8, propAt[1] - 16, 8, 5));
  } else if (opts.prop === 'ball') {
    put('ball', 'Мяч', circle(propAt[0], propAt[1], 18));
  } else if (opts.prop === 'flower') {
    put('prop-flower', 'Цветок', circle(propAt[0], propAt[1] - 8, 14));
    put('prop-stem', 'Стебель', ellipse(propAt[0], propAt[1] + 18, 4, 16));
  } else if (opts.prop === 'egg') {
    put('egg', 'Яйцо', ellipse(propAt[0], propAt[1], 12, 16));
  } else if (opts.prop === 'fish') {
    put('fish', 'Рыбка', ellipse(propAt[0], propAt[1], 18, 10));
    put('fish-tail', 'Хвост рыбки', [
      [propAt[0] + 16, propAt[1]],
      [propAt[0] + 30, propAt[1] - 10],
      [propAt[0] + 30, propAt[1] + 10],
    ]);
  } else if (opts.prop === 'star') {
    put('magic-star', 'Звезда', star(propAt[0], propAt[1] - 10, 16, 7));
  }
};

export const buildAnimal = (meta: PageMeta, opts: AnimalOpts) => {
  const sketch = new Sketch();
  if (opts.dressHere !== false) sketch.dress(opts.dress ?? 'park');
  addAnimal(sketch, opts);
  return sketch.done(meta);
};

export const buildPair = (meta: PageMeta, dress: DressKind, a: AnimalOpts, b: AnimalOpts) => {
  const sketch = new Sketch();
  sketch.dress(dress);
  addAnimal(sketch, { ...a, dressHere: false });
  addAnimal(sketch, { ...b, dressHere: false });
  return sketch.done(meta);
};
