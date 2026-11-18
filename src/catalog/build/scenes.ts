import {
  arcBand,
  circle,
  cloud,
  ellipse,
  rect,
  ribbon,
  rotate,
  roundRect,
  sampleQuad,
  smile,
  star,
} from '../geometry';
import type { PageGeometry, PageMeta } from '../types';
import { Sketch } from './sketch';

const wheel = (s: Sketch, id: string, x: number, y: number, r: number) => {
  s.add(id, 'Колесо', circle(x, y, r));
  s.add(`${id}-hub`, 'Ступица', circle(x, y, r * 0.45));
};

const bloom = (s: Sketch, id: string, x: number, y: number, r: number) => {
  for (let i = 0; i < 5; i += 1) {
    const angle = (i / 5) * Math.PI * 2;
    s.add(`${id}-p${i}`, 'Лепесток', ellipse(x + Math.cos(angle) * r * 0.7, y + Math.sin(angle) * r * 0.7, r * 0.55, r * 0.32));
  }
  s.add(`${id}-c`, 'Сердцевина', circle(x, y, r * 0.38));
};

const tree = (s: Sketch, id: string, x: number, y: number, scale: number) => {
  s.add(`${id}-trunk`, 'Ствол', roundRect(x - 12 * scale, y, 24 * scale, 70 * scale, 8));
  s.add(`${id}-crown-a`, 'Крона', circle(x, y - 10 * scale, 48 * scale));
  s.add(`${id}-crown-b`, 'Крона', circle(x - 32 * scale, y + 8 * scale, 34 * scale));
  s.add(`${id}-crown-c`, 'Крона', circle(x + 32 * scale, y + 6 * scale, 32 * scale));
};

const face = (s: Sketch, x: number, y: number, r: number, prefix = 'face') => {
  s.add(`${prefix}-eye-l`, 'Левый глаз', circle(x - r * 0.34, y, r * 0.16));
  s.add(`${prefix}-eye-r`, 'Правый глаз', circle(x + r * 0.34, y, r * 0.16));
  s.add(`${prefix}-nose`, 'Нос', circle(x, y + r * 0.28, Math.max(4, r * 0.1)));
  s.decor(smile(x, y + r * 0.48, r * 0.28).points, 3.5);
};

export const person = (
  meta: PageMeta,
  o: {
    dress?: 'park' | 'room' | 'plain' | 'space' | 'snow';
    hat?: 'none' | 'crown' | 'chef' | 'fire' | 'cap' | 'hardhat' | 'astro' | 'police' | 'flower' | 'wizard';
    gown?: boolean;
    hair?: 'short' | 'long' | 'bun';
    prop?: 'book' | 'hammer' | 'ball' | 'pot' | 'hose' | 'wand' | 'cake' | 'none';
    wings?: boolean;
    coatCross?: boolean;
  },
): PageGeometry => {
  const s = new Sketch();
  s.dress(o.dress ?? 'room');
  if (o.wings) {
    s.add('wing-l', 'Крыло', rotate(ellipse(130, 190, 70, 28), 160, 190, -28));
    s.add('wing-r', 'Крыло', rotate(ellipse(270, 190, 70, 28), 240, 190, 28));
  }
  if (o.hair === 'long') {
    s.add('hair-l', 'Волосы', ellipse(150, 170, 22, 70));
    s.add('hair-r', 'Волосы', ellipse(250, 170, 22, 70));
  }
  s.add('body', o.gown ? 'Платье' : 'Одежда', o.gown
    ? [[150, 168], [250, 168], [300, 330], [100, 330]]
    : roundRect(166, 152, 68, 92, 20));
  if (o.coatCross) {
    s.add('cross-v', 'Крестик', rect(194, 176, 12, 28));
    s.add('cross-h', 'Крестик', rect(184, 184, 32, 10));
  }
  s.add('arm-l', 'Левая рука', roundRect(126, 164, 30, 72, 14));
  s.add('arm-r', 'Правая рука', roundRect(244, 164, 30, 72, 14));
  if (!o.gown) {
    s.add('leg-l', 'Левая нога', roundRect(176, 236, 22, 64, 10));
    s.add('leg-r', 'Правая нога', roundRect(202, 236, 22, 64, 10));
    s.add('shoe-l', 'Ботинок', ellipse(186, 308, 18, 10));
    s.add('shoe-r', 'Ботинок', ellipse(214, 308, 18, 10));
  }
  s.add('head', 'Лицо', circle(200, 136, 40));
  s.add('hair', 'Волосы', ellipse(200, 108, 44, 26));
  if (o.hair === 'bun') s.add('bun', 'Пучок', circle(200, 84, 14));
  face(s, 200, 136, 40);
  if (o.hat === 'crown') {
    s.add('crown', 'Корона', [[166, 104], [178, 74], [200, 96], [222, 68], [234, 104]]);
  } else if (o.hat === 'chef') {
    s.add('hat', 'Колпак', ellipse(200, 78, 34, 26));
    s.add('hat-band', 'Ободок', rect(172, 96, 56, 12));
  } else if (o.hat === 'fire' || o.hat === 'hardhat' || o.hat === 'police' || o.hat === 'cap') {
    s.add('hat', 'Шляпа', ellipse(200, 96, 42, 16));
    s.add('hat-top', 'Верх шляпы', roundRect(176, 70, 48, 24, 8));
  } else if (o.hat === 'astro') {
    s.add('helmet', 'Шлем', circle(200, 136, 50));
    s.add('visor', 'Стекло', ellipse(200, 140, 28, 18));
    s.add('backpack', 'Рюкзак', roundRect(108, 168, 36, 70, 10));
  } else if (o.hat === 'flower') {
    bloom(s, 'hatflower', 232, 88, 16);
  } else if (o.hat === 'wizard') {
    s.add('hat', 'Колпак', [[160, 108], [200, 36], [240, 108]]);
    s.add('hat-band', 'Лента', rect(168, 102, 64, 12));
  }
  if (o.prop === 'book') s.add('book', 'Книга', roundRect(250, 210, 46, 34, 6));
  if (o.prop === 'hammer') {
    s.add('handle', 'Ручка', rect(286, 150, 10, 70));
    s.add('hammer', 'Молоток', rect(270, 138, 42, 16));
  }
  if (o.prop === 'ball') s.add('ball', 'Мяч', circle(300, 250, 22));
  if (o.prop === 'pot') s.add('pot', 'Кастрюля', ellipse(300, 230, 28, 18));
  if (o.prop === 'hose') s.add('hose', 'Рукав', ribbon([[250, 210], [300, 190], [330, 230], [300, 270]], 14));
  if (o.prop === 'wand') {
    s.add('wand', 'Палочка', ribbon([[246, 200], [320, 140]], 8));
    s.add('wand-star', 'Звезда', star(324, 132, 14, 6));
  }
  if (o.prop === 'cake') {
    s.add('cake', 'Тортик', roundRect(262, 200, 52, 36, 8));
    s.add('frost', 'Крем', ellipse(288, 200, 26, 10));
  }
  return s.done(meta);
};

export const sceneMakers: Record<string, (meta: PageMeta) => PageGeometry> = {
  'whale-hello': (meta) => {
    const s = new Sketch();
    s.dress('sea');
    s.add('body', 'Тело', ellipse(190, 230, 110, 58));
    s.add('belly', 'Живот', ellipse(190, 248, 72, 28));
    s.add('tail', 'Хвост', [[120, 200], [36, 168], [28, 230], [36, 286], [120, 258]]);
    s.add('fin', 'Плавник', [[210, 176], [250, 130], [246, 190]]);
    s.add('flip', 'Ласт', ellipse(150, 270, 28, 14));
    s.add('eye', 'Глаз', circle(262, 214, 10));
    s.add('pupil', 'Зрачок', circle(265, 214, 5));
    s.decor(smile(250, 236, 16).points, 4);
    s.add('spout', 'Фонтанчик', ellipse(175, 176, 12, 16));
    return s.done(meta);
  },
  'dolphin-jump': (meta) => {
    const s = new Sketch();
    s.dress('sea');
    s.add('body', 'Тело', rotate(ellipse(200, 230, 100, 36), 200, 230, -28));
    s.add('belly', 'Живот', rotate(ellipse(200, 242, 60, 16), 200, 240, -28));
    s.add('snout', 'Нос', rotate(ellipse(300, 180, 36, 14), 290, 190, -28));
    s.add('fin', 'Плавник', [[190, 190], [210, 140], [230, 196]]);
    s.add('tail', 'Хвост', [[110, 270], [70, 250], [96, 286], [74, 310]]);
    s.add('eye', 'Глаз', circle(268, 196, 8));
    s.decor(smile(274, 210, 12).points, 3);
    return s.done(meta);
  },
  'fish-stripes': (meta) => {
    const s = new Sketch();
    s.dress('sea');
    s.add('body', 'Тело', ellipse(200, 220, 90, 52));
    s.add('stripe-a', 'Полоска', ellipse(170, 220, 12, 40));
    s.add('stripe-b', 'Полоска', ellipse(200, 220, 12, 44));
    s.add('stripe-c', 'Полоска', ellipse(230, 220, 12, 36));
    s.add('tail', 'Хвост', [[112, 220], [62, 180], [78, 220], [62, 258]]);
    s.add('fin-top', 'Плавник', [[190, 170], [220, 120], [236, 176]]);
    s.add('fin-side', 'Плавник', ellipse(176, 258, 24, 12));
    s.add('eye', 'Глаз', circle(262, 206, 12));
    s.add('pupil', 'Зрачок', circle(265, 206, 6));
    s.decor(smile(250, 228, 14).points, 3);
    return s.done(meta);
  },
  'bird-song': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('branch', 'Ветка', ribbon([[40, 300], [180, 270], [340, 290]], 12));
    s.add('body', 'Тело', ellipse(200, 210, 46, 36));
    s.add('head', 'Голова', circle(246, 176, 26));
    s.add('wing', 'Крыло', ellipse(190, 214, 28, 18));
    s.add('beak', 'Клюв', [[268, 176], [296, 184], [268, 192]]);
    s.add('tail', 'Хвост', [[150, 200], [96, 176], [110, 214], [150, 220]]);
    s.add('eye', 'Глаз', circle(254, 170, 7));
    s.add('leg', 'Лапка', ribbon([[190, 242], [186, 268]], 6));
    return s.done(meta);
  },
  'owl-night': (meta) => {
    const s = new Sketch();
    s.dress('night');
    s.add('branch', 'Ветка', ribbon([[30, 310], [200, 280], [370, 306]], 14));
    s.add('body', 'Тело', ellipse(200, 200, 70, 78));
    s.add('belly', 'Живот', ellipse(200, 220, 40, 48));
    s.add('head', 'Голова', circle(200, 132, 48));
    s.add('tuft-l', 'Перо', [[160, 100], [176, 58], [196, 104]]);
    s.add('tuft-r', 'Перо', [[204, 104], [224, 58], [240, 100]]);
    s.add('eye-l', 'Левый глаз', circle(180, 132, 16));
    s.add('eye-r', 'Правый глаз', circle(220, 132, 16));
    s.add('pupil-l', 'Зрачок', circle(180, 134, 7));
    s.add('pupil-r', 'Зрачок', circle(220, 134, 7));
    s.add('beak', 'Клюв', [[192, 148], [208, 148], [200, 166]]);
    s.add('wing', 'Крыло', ellipse(138, 210, 26, 40));
    return s.done(meta);
  },
  'butterfly-garden': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('wing-tl', 'Крыло', rotate(ellipse(150, 150, 62, 40), 170, 170, -20));
    s.add('wing-tr', 'Крыло', rotate(ellipse(250, 150, 62, 40), 230, 170, 20));
    s.add('wing-bl', 'Крыло', rotate(ellipse(156, 210, 48, 32), 170, 200, 16));
    s.add('wing-br', 'Крыло', rotate(ellipse(244, 210, 48, 32), 230, 200, -16));
    s.add('spot-a', 'Пятно', circle(140, 146, 10));
    s.add('spot-b', 'Пятно', circle(260, 146, 10));
    s.add('body', 'Тело', ellipse(200, 186, 12, 42));
    s.add('head', 'Голова', circle(200, 138, 12));
    s.decor(sampleQuad([192, 128], [180, 100], [170, 112]), 3);
    s.decor(sampleQuad([208, 128], [220, 100], [230, 112]), 3);
    return s.done(meta);
  },
  'bee-flower': (meta) => {
    const s = new Sketch();
    s.dress('park');
    bloom(s, 'flower', 300, 250, 28);
    s.add('stem', 'Стебель', ribbon([[300, 270], [300, 340]], 8));
    s.add('wing-l', 'Крыло', ellipse(150, 150, 28, 16));
    s.add('wing-r', 'Крыло', ellipse(196, 146, 26, 15));
    s.add('body', 'Тело', ellipse(176, 190, 36, 48));
    s.add('stripe-a', 'Полоска', ellipse(176, 176, 30, 8));
    s.add('stripe-b', 'Полоска', ellipse(176, 196, 32, 8));
    s.add('stripe-c', 'Полоска', ellipse(176, 216, 26, 8));
    s.add('head', 'Голова', circle(176, 136, 20));
    s.add('eye-l', 'Глаз', circle(168, 134, 5));
    s.add('eye-r', 'Глаз', circle(184, 134, 5));
    return s.done(meta);
  },
  'hen-egg': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('body', 'Тело', ellipse(200, 220, 70, 52));
    s.add('wing', 'Крыло', ellipse(176, 226, 28, 20));
    s.add('tail', 'Хвост', [[140, 190], [96, 160], [120, 200], [110, 214]]);
    s.add('head', 'Голова', circle(262, 176, 28));
    s.add('comb', 'Гребешок', [[250, 150], [262, 124], [274, 148], [286, 128], [280, 156]]);
    s.add('beak', 'Клюв', [[286, 176], [314, 184], [286, 194]]);
    s.add('wattle', 'Серёжка', ellipse(274, 202, 8, 10));
    s.add('eye', 'Глаз', circle(270, 170, 6));
    s.add('leg-l', 'Лапка', ribbon([[180, 268], [170, 310]], 6));
    s.add('leg-r', 'Лапка', ribbon([[214, 270], [220, 312]], 6));
    s.add('egg', 'Яйцо', ellipse(92, 300, 16, 22));
    return s.done(meta);
  },
  'forest-pines': (meta) => {
    const s = new Sketch();
    s.dress('park');
    const pine = (id: string, x: number, y: number, sc: number) => {
      s.add(`${id}-trunk`, 'Ствол', rect(x - 8 * sc, y, 16 * sc, 50 * sc));
      s.add(`${id}-a`, 'Лапки', [[x, y - 90 * sc], [x - 46 * sc, y], [x + 46 * sc, y]]);
      s.add(`${id}-b`, 'Лапки', [[x, y - 58 * sc], [x - 36 * sc, y + 10 * sc], [x + 36 * sc, y + 10 * sc]]);
    };
    pine('p1', 80, 250, 1);
    pine('p2', 200, 230, 1.25);
    pine('p3', 320, 260, 0.9);
    s.add('bush', 'Куст', ellipse(40, 320, 28, 16));
    return s.done(meta);
  },
  'mushroom-house': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('stem', 'Ножка', roundRect(160, 180, 80, 120, 20));
    s.add('cap', 'Шляпка', ellipse(200, 170, 120, 70));
    s.add('spot-a', 'Пятно', circle(150, 150, 14));
    s.add('spot-b', 'Пятно', circle(210, 132, 16));
    s.add('spot-c', 'Пятно', circle(250, 160, 12));
    s.add('door', 'Дверь', roundRect(184, 230, 32, 50, 10));
    s.add('window', 'Окошко', circle(168, 214, 10));
    return s.done(meta);
  },
  'tulip-one': (meta) => {
    const s = new Sketch();
    s.dress('plain');
    s.add('ground', 'Земля', ellipse(200, 370, 120, 28));
    s.add('stem', 'Стебель', ribbon([[200, 300], [200, 170]], 10));
    s.add('leaf-l', 'Лист', rotate(ellipse(150, 250, 40, 14), 160, 250, -30));
    s.add('leaf-r', 'Лист', rotate(ellipse(250, 230, 36, 12), 240, 230, 24));
    s.add('petal-l', 'Лепесток', ellipse(176, 140, 28, 46));
    s.add('petal-r', 'Лепесток', ellipse(224, 140, 28, 46));
    s.add('petal-c', 'Лепесток', ellipse(200, 128, 24, 50));
    return s.done(meta);
  },
  'bouquet-mix': (meta) => {
    const s = new Sketch();
    s.dress('room');
    bloom(s, 'f1', 150, 150, 26);
    bloom(s, 'f2', 230, 130, 24);
    bloom(s, 'f3', 200, 190, 20);
    s.add('stem-a', 'Стебель', ribbon([[150, 176], [170, 280]], 7));
    s.add('stem-b', 'Стебель', ribbon([[230, 156], [210, 280]], 7));
    s.add('stem-c', 'Стебель', ribbon([[200, 210], [196, 286]], 7));
    s.add('wrap', 'Обёртка', [[150, 250], [250, 250], [230, 330], [170, 330]]);
    s.add('bow', 'Бант', ellipse(200, 250, 28, 14));
    return s.done(meta);
  },
  'oak-tree': (meta) => {
    const s = new Sketch();
    s.dress('park');
    tree(s, 'oak', 200, 250, 1.4);
    s.add('hole', 'Дупло', ellipse(200, 300, 12, 16));
    return s.done(meta);
  },
  'apple-tree': (meta) => {
    const s = new Sketch();
    s.dress('park');
    tree(s, 'apple', 200, 250, 1.3);
    s.add('fruit-a', 'Яблоко', circle(160, 230, 12));
    s.add('fruit-b', 'Яблоко', circle(230, 214, 12));
    s.add('fruit-c', 'Яблоко', circle(200, 250, 11));
    return s.done(meta);
  },
  'garden-bed': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('bed', 'Грядка', roundRect(70, 200, 260, 90, 16));
    s.add('soil', 'Земля', roundRect(86, 214, 228, 60, 12));
    bloom(s, 'g1', 120, 180, 16);
    bloom(s, 'g2', 190, 168, 16);
    bloom(s, 'g3', 260, 180, 16);
    s.add('carrot', 'Морковка', [[300, 250], [324, 246], [312, 300]]);
    return s.done(meta);
  },
  'watering-can': (meta) => {
    const s = new Sketch();
    s.dress('park');
    bloom(s, 'side', 90, 250, 22);
    s.add('can', 'Лейка', roundRect(150, 180, 120, 80, 16));
    s.add('handle', 'Ручка', arcBand(150, 210, 24, 36, Math.PI * 0.5, Math.PI * 1.5, 12));
    s.add('spout', 'Носик', ribbon([[260, 200], [320, 170]], 16));
    s.add('rose', 'Рассеиватель', circle(328, 164, 16));
    s.add('drop-a', 'Капля', ellipse(300, 150, 5, 8));
    s.add('drop-b', 'Капля', ellipse(340, 140, 5, 8));
    return s.done(meta);
  },
  'rainbow-sky': (meta) => {
    const s = new Sketch();
    s.dress('park');
    const colors = ['Красная дуга', 'Оранжевая дуга', 'Жёлтая дуга', 'Зелёная дуга', 'Голубая дуга'];
    colors.forEach((name, index) => {
      const inner = 150 - index * 18;
      s.add(`arc-${index}`, name, arcBand(200, 300, inner - 16, inner, Math.PI, Math.PI * 2, 20));
    });
    s.add('cloud-l', 'Облако', cloud(70, 286, 0.8));
    s.add('cloud-r', 'Облако', cloud(330, 286, 0.8));
    return s.done(meta);
  },
  'season-spring': (meta) => {
    const s = new Sketch();
    s.dress('park');
    bloom(s, 'a', 80, 300, 18);
    bloom(s, 'b', 160, 320, 16);
    bloom(s, 'c', 250, 300, 20);
    bloom(s, 'd', 330, 324, 15);
    s.add('butterfly', 'Бабочка', ellipse(120, 180, 16, 10));
    return s.done(meta);
  },
  'season-summer': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('sea', 'Море', rect(0, 230, 400, 170));
    s.add('ball', 'Мяч', circle(120, 300, 28));
    s.add('stripe', 'Полоска', ellipse(120, 300, 28, 8));
    s.add('umbrella', 'Зонт', arcBand(260, 280, 10, 70, Math.PI, Math.PI * 2, 16));
    s.add('pole', 'Палочка', rect(256, 280, 8, 70));
    return s.done(meta);
  },
  'season-autumn': (meta) => {
    const s = new Sketch();
    s.dress('park');
    tree(s, 'oak', 200, 240, 1.2);
    s.add('leaf-a', 'Лист', rotate(ellipse(80, 180, 16, 8), 80, 180, 30));
    s.add('leaf-b', 'Лист', rotate(ellipse(300, 150, 16, 8), 300, 150, -20));
    s.add('leaf-c', 'Лист', rotate(ellipse(140, 120, 14, 7), 140, 120, 40));
    s.add('leaf-d', 'Лист', ellipse(250, 320, 14, 8));
    return s.done(meta);
  },
  'season-winter': (meta) => {
    const s = new Sketch();
    s.dress('snow');
    tree(s, 'pine', 200, 240, 1.1);
    s.add('hat', 'Снег на ветке', ellipse(200, 200, 40, 12));
    s.add('snowball', 'Снежок', circle(80, 320, 16));
    return s.done(meta);
  },
  'coral-reef': (meta) => {
    const s = new Sketch();
    s.dress('sea');
    s.add('coral-a', 'Коралл', ribbon([[120, 320], [110, 250], [90, 210]], 18));
    s.add('coral-b', 'Коралл', ribbon([[120, 320], [140, 240], [160, 200]], 16));
    s.add('coral-c', 'Коралл', ribbon([[250, 330], [260, 250], [290, 210]], 18));
    s.add('fish', 'Рыбка', ellipse(200, 160, 28, 16));
    s.add('fish-tail', 'Хвост', [[174, 160], [150, 146], [150, 174]]);
    s.add('fish-eye', 'Глаз', circle(218, 156, 4));
    s.add('shell', 'Ракушка', ellipse(70, 330, 20, 12));
    return s.done(meta);
  },
  'sea-shells': (meta) => {
    const s = new Sketch();
    s.dress('sea');
    s.add('shell-a', 'Ракушка', ellipse(120, 250, 50, 34));
    s.add('shell-a-in', 'Узор', ellipse(120, 250, 24, 16));
    s.add('shell-b', 'Ракушка', rotate(ellipse(240, 280, 46, 28), 240, 280, 20));
    s.add('pearl', 'Жемчужина', circle(250, 220, 14));
    s.add('star', 'Звезда', star(320, 250, 22, 10));
    return s.done(meta);
  },
  'mountain-lake': (meta) => {
    const s = new Sketch();
    s.dress('plain');
    s.add('mount-l', 'Гора', [[20, 250], [110, 80], [200, 250]]);
    s.add('mount-r', 'Гора', [[160, 250], [270, 50], [380, 250]]);
    s.add('snow-l', 'Снег', [[90, 130], [110, 80], [140, 140]]);
    s.add('snow-r', 'Снег', [[240, 110], [270, 50], [305, 120]]);
    s.add('lake', 'Озеро', ellipse(200, 320, 150, 40));
    s.add('sun', 'Солнце', circle(60, 60, 24));
    return s.done(meta);
  },
  'sunny-hills': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('hill-a', 'Холм', ellipse(90, 340, 120, 50));
    s.add('hill-b', 'Холм', ellipse(280, 350, 150, 46));
    tree(s, 'one', 300, 250, 0.7);
    bloom(s, 'f', 80, 300, 14);
    return s.done(meta);
  },
  'planet-earth': (meta) => {
    const s = new Sketch();
    s.dress('space');
    s.add('planet', 'Планета', circle(200, 210, 90));
    s.add('land-a', 'Материк', ellipse(170, 190, 36, 22));
    s.add('land-b', 'Материк', ellipse(230, 230, 28, 18));
    s.add('land-c', 'Остров', circle(150, 240, 12));
    return s.done(meta);
  },
  'planet-saturn': (meta) => {
    const s = new Sketch();
    s.dress('space');
    s.add('ring-back', 'Кольцо', ellipse(200, 210, 150, 28));
    s.add('planet', 'Планета', circle(200, 210, 70));
    s.add('ring-front', 'Кольцо', arcBand(200, 210, 108, 132, 0, Math.PI, 18));
    return s.done(meta);
  },
  'rocket-fly': (meta) => {
    const s = new Sketch();
    s.dress('space');
    s.add('body', 'Корпус', roundRect(170, 90, 60, 170, 24));
    s.add('nose', 'Нос', [[170, 110], [200, 40], [230, 110]]);
    s.add('window', 'Иллюминатор', circle(200, 150, 16));
    s.add('fin-l', 'Крыло', [[170, 200], [130, 250], [170, 246]]);
    s.add('fin-r', 'Крыло', [[230, 200], [270, 250], [230, 246]]);
    s.add('flame', 'Пламя', [[182, 258], [200, 320], [218, 258]]);
    return s.done(meta);
  },
  'rocket-launch': (meta) => {
    const s = new Sketch();
    s.dress('space');
    s.add('pad', 'Площадка', roundRect(80, 300, 240, 28, 8));
    s.add('tower', 'Башня', rect(300, 120, 28, 180));
    s.add('body', 'Ракета', roundRect(150, 80, 70, 200, 20));
    s.add('nose', 'Нос', [[150, 100], [185, 36], [220, 100]]);
    s.add('window', 'Окно', circle(185, 140, 14));
    s.add('flame', 'Огонь', [[164, 278], [185, 330], [206, 278]]);
    s.add('smoke', 'Дым', cloud(120, 330, 0.7));
    return s.done(meta);
  },
  'astro-float': (meta) => person(meta, { dress: 'space', hat: 'astro', prop: 'none' }),
  'big-star': (meta) => {
    const s = new Sketch();
    s.dress('space');
    s.add('star', 'Звезда', star(200, 210, 110, 48));
    s.add('eye-l', 'Глаз', circle(176, 200, 10));
    s.add('eye-r', 'Глаз', circle(224, 200, 10));
    s.decor(smile(200, 230, 24).points, 4);
    return s.done(meta);
  },
  'alien-friend': (meta) => {
    const s = new Sketch();
    s.dress('space');
    s.add('body', 'Тело', ellipse(200, 230, 70, 80));
    s.add('head', 'Голова', ellipse(200, 130, 78, 58));
    s.add('eye-l', 'Глаз', ellipse(168, 130, 22, 26));
    s.add('eye-r', 'Глаз', ellipse(232, 130, 22, 26));
    s.add('pupil-l', 'Зрачок', circle(168, 134, 8));
    s.add('pupil-r', 'Зрачок', circle(232, 134, 8));
    s.add('ant-l', 'Антенна', ribbon([[170, 80], [150, 40]], 6));
    s.add('ant-r', 'Антенна', ribbon([[230, 80], [250, 40]], 6));
    s.add('ant-ball-l', 'Шарик', circle(148, 36, 8));
    s.add('ant-ball-r', 'Шарик', circle(252, 36, 8));
    s.decor(smile(200, 156, 16).points, 3);
    return s.done(meta);
  },
  'ufo-night': (meta) => {
    const s = new Sketch();
    s.dress('space');
    s.add('dome', 'Купол', arcBand(200, 200, 20, 70, Math.PI, Math.PI * 2, 16));
    s.add('saucer', 'Тарелка', ellipse(200, 210, 130, 36));
    s.add('light-a', 'Огонёк', circle(120, 214, 10));
    s.add('light-b', 'Огонёк', circle(200, 226, 10));
    s.add('light-c', 'Огонёк', circle(280, 214, 10));
    s.add('window', 'Окно', circle(200, 168, 16));
    s.add('beam', 'Луч', [[170, 240], [230, 240], [260, 340], [140, 340]]);
    return s.done(meta);
  },
  'ship-space': (meta) => {
    const s = new Sketch();
    s.dress('space');
    s.add('body', 'Корпус', ellipse(200, 200, 120, 48));
    s.add('cabin', 'Кабина', roundRect(170, 130, 60, 50, 16));
    s.add('window', 'Окно', circle(200, 152, 12));
    s.add('wing-l', 'Крыло', [[80, 190], [40, 240], [100, 220]]);
    s.add('wing-r', 'Крыло', [[320, 190], [360, 240], [300, 220]]);
    s.add('flame', 'Пламя', [[150, 240], [120, 310], [180, 250]]);
    return s.done(meta);
  },
  'galaxy-swirl': (meta) => {
    const s = new Sketch();
    s.dress('space');
    s.add('core', 'Центр', circle(200, 200, 28));
    s.add('arm-a', 'Рукав', arcBand(200, 200, 40, 62, 0.4, 2.6, 18));
    s.add('arm-b', 'Рукав', arcBand(200, 200, 70, 92, 2, 4.6, 18));
    s.add('arm-c', 'Рукав', arcBand(200, 200, 100, 118, 3.4, 5.8, 16));
    s.add('dust', 'Звезда', star(90, 120, 12, 5));
    return s.done(meta);
  },
};

const carBody = (s: Sketch, y: number, h: number) => {
  s.add('body', 'Кузов', roundRect(50, y, 280, h, 18));
  s.add('roof', 'Крыша', [[120, y], [150, y - 48], [250, y - 48], [280, y]]);
  s.add('window', 'Окно', [[156, y - 40], [246, y - 40], [268, y - 6], [140, y - 6]]);
};

export const vehicleMakers: Record<string, (meta: PageMeta) => PageGeometry> = {
  'car-city': (meta) => {
    const s = new Sketch();
    s.dress('park');
    carBody(s, 190, 70);
    wheel(s, 'w1', 120, 270, 28);
    wheel(s, 'w2', 270, 270, 28);
    s.add('light', 'Фара', circle(320, 214, 10));
    return s.done(meta);
  },
  'car-family': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('body', 'Кузов', roundRect(40, 180, 320, 80, 20));
    s.add('roof', 'Крыша', [[80, 180], [110, 120], [290, 120], [320, 180]]);
    s.add('win-a', 'Окно', [[120, 132], [190, 132], [190, 172], [100, 172]]);
    s.add('win-b', 'Окно', [[210, 132], [280, 132], [300, 172], [210, 172]]);
    wheel(s, 'w1', 110, 270, 30);
    wheel(s, 'w2', 290, 270, 30);
    return s.done(meta);
  },
  'truck-box': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('cargo', 'Кузов', roundRect(40, 120, 180, 110, 10));
    s.add('cab', 'Кабина', roundRect(220, 150, 110, 80, 12));
    s.add('win', 'Окно', rect(240, 164, 50, 32));
    wheel(s, 'w1', 90, 250, 26);
    wheel(s, 'w2', 180, 250, 26);
    wheel(s, 'w3', 290, 250, 26);
    return s.done(meta);
  },
  'plane-sky': (meta) => {
    const s = new Sketch();
    s.dress('plain');
    s.add('sun', 'Солнце', circle(60, 60, 26));
    s.add('cloud', 'Облако', cloud(300, 80, 0.8));
    s.add('body', 'Фюзеляж', ellipse(200, 200, 130, 36));
    s.add('wing', 'Крыло', [[80, 190], [200, 170], [320, 190], [200, 220]]);
    s.add('tail', 'Хвост', [[70, 180], [40, 130], [90, 186]]);
    s.add('win-a', 'Окно', circle(230, 194, 8));
    s.add('win-b', 'Окно', circle(260, 194, 8));
    s.add('win-c', 'Окно', circle(290, 194, 8));
    return s.done(meta);
  },
  'train-trip': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('engine', 'Паровоз', roundRect(40, 150, 110, 80, 10));
    s.add('cabin', 'Кабина', roundRect(110, 120, 50, 50, 8));
    s.add('chimney', 'Труба', rect(58, 110, 18, 40));
    s.add('car-a', 'Вагон', roundRect(180, 160, 90, 70, 8));
    s.add('car-b', 'Вагон', roundRect(280, 160, 90, 70, 8));
    s.add('win-a', 'Окно', rect(196, 174, 22, 18));
    s.add('win-b', 'Окно', rect(296, 174, 22, 18));
    wheel(s, 'w1', 70, 246, 16);
    wheel(s, 'w2', 130, 246, 16);
    wheel(s, 'w3', 220, 246, 16);
    wheel(s, 'w4', 320, 246, 16);
    return s.done(meta);
  },
  'sailboat-sea': (meta) => {
    const s = new Sketch();
    s.dress('sea');
    s.add('hull', 'Корпус', [[80, 240], [320, 240], [280, 300], [120, 300]]);
    s.add('mast', 'Мачта', rect(196, 80, 8, 160));
    s.add('sail-a', 'Парус', [[204, 90], [204, 200], [290, 200]]);
    s.add('sail-b', 'Парус', [[196, 110], [196, 200], [120, 200]]);
    s.add('flag', 'Флаг', [[196, 80], [230, 92], [196, 104]]);
    return s.done(meta);
  },
  'steamer-ship': (meta) => {
    const s = new Sketch();
    s.dress('sea');
    s.add('hull', 'Корпус', [[40, 230], [360, 230], [320, 310], [80, 310]]);
    s.add('cabin', 'Каюта', roundRect(140, 160, 140, 70, 8));
    s.add('win-a', 'Окно', circle(170, 194, 8));
    s.add('win-b', 'Окно', circle(210, 194, 8));
    s.add('win-c', 'Окно', circle(250, 194, 8));
    s.add('funnel', 'Труба', roundRect(180, 100, 36, 60, 6));
    s.add('smoke', 'Дым', cloud(200, 70, 0.6));
    return s.done(meta);
  },
  'moto-ride': (meta) => {
    const s = new Sketch();
    s.dress('park');
    wheel(s, 'w1', 110, 250, 36);
    wheel(s, 'w2', 280, 250, 36);
    s.add('frame', 'Рама', ribbon([[110, 250], [180, 190], [250, 190], [280, 250]], 10));
    s.add('seat', 'Сиденье', ellipse(200, 176, 36, 12));
    s.add('tank', 'Бак', ellipse(230, 196, 28, 16));
    s.add('bar', 'Руль', ribbon([[250, 190], [270, 150], [300, 146]], 8));
    return s.done(meta);
  },
  'digger-work': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('tracks', 'Гусеницы', roundRect(70, 230, 180, 40, 16));
    s.add('cab', 'Кабина', roundRect(90, 150, 90, 80, 10));
    s.add('win', 'Окно', rect(104, 164, 40, 30));
    s.add('arm', 'Стрела', ribbon([[180, 170], [260, 120], [320, 150]], 12));
    s.add('bucket', 'Ковш', [[310, 140], [360, 150], [340, 190], [300, 176]]);
    return s.done(meta);
  },
  'firetruck-go': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('body', 'Кузов', roundRect(40, 150, 300, 80, 10));
    s.add('cab', 'Кабина', roundRect(40, 170, 90, 60, 8));
    s.add('win', 'Окно', rect(54, 182, 40, 24));
    s.add('ladder', 'Лестница', rect(150, 120, 160, 16));
    s.add('light', 'Мигалка', rect(70, 136, 28, 16));
    wheel(s, 'w1', 100, 246, 24);
    wheel(s, 'w2', 280, 246, 24);
    return s.done(meta);
  },
  'race-speed': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('body', 'Кузов', [[40, 200], [300, 180], [340, 210], [320, 250], [50, 250]]);
    s.add('cockpit', 'Кабина', [[160, 186], [230, 176], [240, 206], [150, 210]]);
    s.add('spoiler', 'Спойлер', [[40, 176], [90, 176], [70, 210], [30, 206]]);
    s.add('number', 'Номер', circle(250, 220, 16));
    wheel(s, 'w1', 110, 258, 26);
    wheel(s, 'w2', 280, 258, 26);
    return s.done(meta);
  },
};
