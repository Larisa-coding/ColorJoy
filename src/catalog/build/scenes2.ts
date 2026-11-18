import {
  circle,
  ellipse,
  heart,
  rect,
  ribbon,
  rotate,
  roundRect,
  smile,
  star,
} from '../geometry';
import type { PageGeometry, PageMeta } from '../types';
import { person } from './scenes';
import { Sketch } from './sketch';

const wheel = (s: Sketch, id: string, x: number, y: number, r: number) => {
  s.add(id, 'Колесо', circle(x, y, r));
  s.add(`${id}-hub`, 'Ступица', circle(x, y, r * 0.45));
};

const bloom = (s: Sketch, id: string, x: number, y: number, r: number) => {
  for (let i = 0; i < 5; i += 1) {
    const angle = (i / 5) * Math.PI * 2;
    s.add(`${id}-p${i}`, 'Лепесток', ellipse(x + Math.cos(angle) * r * 0.65, y + Math.sin(angle) * r * 0.65, r * 0.5, r * 0.28));
  }
  s.add(`${id}-c`, 'Сердцевина', circle(x, y, r * 0.34));
};

export const moreMakers: Record<string, (meta: PageMeta) => PageGeometry> = {
  'robot-dot': (meta) => {
    const s = new Sketch();
    s.dress('room');
    s.add('head', 'Голова', roundRect(150, 70, 100, 80, 18));
    s.add('ant', 'Антенна', ribbon([[200, 70], [200, 36]], 6));
    s.add('ant-ball', 'Шарик', circle(200, 30, 8));
    s.add('eye-l', 'Глаз', circle(176, 104, 12));
    s.add('eye-r', 'Глаз', circle(224, 104, 12));
    s.add('body', 'Корпус', roundRect(140, 160, 120, 100, 16));
    s.add('panel', 'Панель', roundRect(168, 180, 64, 40, 8));
    s.add('arm-l', 'Рука', roundRect(96, 170, 36, 70, 12));
    s.add('arm-r', 'Рука', roundRect(268, 170, 36, 70, 12));
    s.add('leg-l', 'Нога', roundRect(160, 268, 28, 50, 8));
    s.add('leg-r', 'Нога', roundRect(212, 268, 28, 50, 8));
    return s.done(meta);
  },
  'robot-friend': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('head', 'Голова', circle(200, 120, 48));
    s.add('ear-l', 'Динамик', circle(146, 120, 14));
    s.add('ear-r', 'Динамик', circle(254, 120, 14));
    s.add('eye-l', 'Глаз', rect(172, 104, 22, 16));
    s.add('eye-r', 'Глаз', rect(206, 104, 22, 16));
    s.add('smile-panel', 'Улыбка', roundRect(176, 136, 48, 12, 6));
    s.add('body', 'Тело', roundRect(150, 172, 100, 90, 20));
    s.add('heart', 'Сердце', heart(200, 214, 22));
    s.add('arm-l', 'Рука', roundRect(108, 180, 32, 64, 14));
    s.add('arm-r', 'Рука', roundRect(260, 180, 32, 64, 14));
    wheel(s, 'w1', 176, 290, 22);
    wheel(s, 'w2', 230, 290, 22);
    return s.done(meta);
  },
  'mecha-hero': (meta) => {
    const s = new Sketch();
    s.dress('plain');
    s.add('ground', 'Площадка', ellipse(200, 370, 160, 28));
    s.add('shoulder-l', 'Плечо', circle(90, 150, 36));
    s.add('shoulder-r', 'Плечо', circle(310, 150, 36));
    s.add('body', 'Корпус', roundRect(130, 130, 140, 150, 16));
    s.add('chest', 'Грудь', roundRect(165, 160, 70, 50, 8));
    s.add('head', 'Шлем', roundRect(165, 60, 70, 64, 16));
    s.add('visor', 'Визор', rect(178, 84, 44, 16));
    s.add('arm-l', 'Рука', roundRect(60, 180, 40, 100, 12));
    s.add('arm-r', 'Рука', roundRect(300, 180, 40, 100, 12));
    s.add('leg-l', 'Нога', roundRect(150, 280, 40, 70, 10));
    s.add('leg-r', 'Нога', roundRect(210, 280, 40, 70, 10));
    return s.done(meta);
  },
  'robot-car': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('body', 'Корпус', roundRect(70, 160, 260, 80, 16));
    s.add('cabin', 'Кабина', roundRect(150, 110, 100, 60, 12));
    s.add('eye-l', 'Фара-глаз', circle(110, 194, 12));
    s.add('eye-r', 'Фара-глаз', circle(290, 194, 12));
    s.add('grill', 'Решётка', rect(180, 186, 40, 16));
    wheel(s, 'w1', 120, 260, 28);
    wheel(s, 'w2', 280, 260, 28);
    s.add('ant', 'Антенна', ribbon([[200, 110], [230, 70]], 6));
    return s.done(meta);
  },
  'fantasy-engine': (meta) => {
    const s = new Sketch();
    s.dress('night');
    s.add('base', 'Основание', roundRect(80, 220, 240, 70, 16));
    s.add('boiler', 'Котёл', circle(160, 190, 50));
    s.add('cabin', 'Кабина', roundRect(210, 140, 90, 90, 12));
    s.add('win', 'Окно', circle(255, 180, 16));
    s.add('pipe', 'Труба', rect(120, 100, 22, 50));
    s.add('gear', 'Шестерёнка', star(320, 250, 28, 16, 8));
    s.add('smoke', 'Пар', circle(131, 80, 16));
    return s.done(meta);
  },
  'mech-puppy': (meta) => {
    const s = new Sketch();
    s.dress('room');
    s.add('body', 'Корпус', roundRect(120, 160, 160, 100, 24));
    s.add('head', 'Голова', roundRect(200, 90, 110, 90, 20));
    s.add('ear-l', 'Ухо', roundRect(190, 60, 28, 40, 8));
    s.add('ear-r', 'Ухо', roundRect(290, 70, 28, 36, 8));
    s.add('eye-l', 'Глаз', circle(236, 130, 10));
    s.add('eye-r', 'Глаз', circle(276, 130, 10));
    s.add('nose', 'Нос', roundRect(248, 150, 20, 14, 4));
    s.add('panel', 'Панель', rect(160, 190, 50, 30));
    wheel(s, 'paw-l', 160, 280, 22);
    wheel(s, 'paw-r', 250, 280, 22);
    s.add('tail', 'Хвост', ribbon([[120, 180], [80, 150], [70, 190]], 12));
    return s.done(meta);
  },
  'princess-rose': (meta) => person(meta, { dress: 'park', hat: 'crown', gown: true, hair: 'long', prop: 'none' }),
  'castle-dream': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('wall', 'Стена', rect(90, 160, 220, 160));
    s.add('tower-l', 'Башня', rect(60, 110, 60, 210));
    s.add('tower-r', 'Башня', rect(280, 90, 60, 230));
    s.add('roof-l', 'Крыша', [[60, 120], [90, 60], [120, 120]]);
    s.add('roof-r', 'Крыша', [[280, 100], [310, 40], [340, 100]]);
    s.add('gate', 'Ворота', roundRect(176, 230, 48, 90, 20));
    s.add('win-a', 'Окно', circle(150, 200, 12));
    s.add('win-b', 'Окно', circle(250, 200, 12));
    s.add('flag', 'Флаг', [[310, 40], [346, 52], [310, 64]]);
    return s.done(meta);
  },
  'fairy-light': (meta) => person(meta, { dress: 'park', hat: 'flower', gown: true, hair: 'bun', wings: true, prop: 'wand' }),
  'dragon-kind': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('tail', 'Хвост', ribbon([[80, 250], [40, 210], [70, 180], [40, 150]], 16));
    s.add('body', 'Тело', ellipse(170, 230, 80, 48));
    s.add('belly', 'Живот', ellipse(180, 246, 46, 22));
    s.add('neck', 'Шея', ribbon([[220, 200], [260, 150], [290, 130]], 22));
    s.add('head', 'Голова', ellipse(310, 120, 40, 28));
    s.add('horn', 'Рог', [[300, 100], [310, 60], [324, 104]]);
    s.add('eye', 'Глаз', circle(324, 112, 6));
    s.add('wing', 'Крыло', [[150, 190], [120, 80], [210, 120], [200, 200]]);
    s.add('leg-a', 'Лапа', ellipse(140, 280, 18, 12));
    s.add('leg-b', 'Лапа', ellipse(210, 284, 18, 12));
    s.add('flame', 'Огонёк', [[346, 124], [390, 110], [350, 140]]);
    return s.done(meta);
  },
  'magic-trees': (meta) => {
    const s = new Sketch();
    s.dress('night');
    s.add('trunk-a', 'Ствол', ribbon([[120, 320], [130, 180]], 16));
    s.add('crown-a', 'Крона', circle(120, 160, 50));
    s.add('trunk-b', 'Ствол', ribbon([[260, 330], [250, 170]], 18));
    s.add('crown-b', 'Крона', circle(270, 150, 64));
    s.add('glow', 'Светлячок', circle(180, 120, 8));
    s.add('glow-b', 'Светлячок', circle(300, 200, 6));
    s.add('mushroom', 'Гриб', ellipse(60, 320, 20, 14));
    return s.done(meta);
  },
  'mermaid-pearl': (meta) => {
    const s = new Sketch();
    s.dress('sea');
    s.add('tail', 'Хвост', ribbon([[200, 220], [180, 280], [230, 320], [160, 350]], 28));
    s.add('fin', 'Плавник', [[150, 340], [120, 370], [190, 360]]);
    s.add('body', 'Тело', roundRect(174, 140, 52, 80, 18));
    s.add('hair', 'Волосы', ellipse(200, 100, 46, 36));
    s.add('head', 'Лицо', circle(200, 112, 28));
    s.add('eye-l', 'Глаз', circle(190, 110, 5));
    s.add('eye-r', 'Глаз', circle(210, 110, 5));
    s.add('arm', 'Рука', roundRect(230, 160, 24, 50, 10));
    s.add('pearl', 'Жемчужина', circle(300, 200, 14));
    s.add('shell', 'Ракушка', ellipse(300, 230, 18, 10));
    s.decor(smile(200, 124, 10).points, 3);
    return s.done(meta);
  },
  'trex-smile': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('tail', 'Хвост', ribbon([[70, 230], [30, 200], [60, 180]], 18));
    s.add('body', 'Тело', ellipse(170, 210, 70, 46));
    s.add('belly', 'Живот', ellipse(180, 228, 36, 20));
    s.add('leg', 'Нога', ellipse(190, 270, 26, 32));
    s.add('foot', 'Стопа', ellipse(220, 304, 28, 12));
    s.add('arm', 'Лапка', ellipse(230, 200, 14, 8));
    s.add('head', 'Голова', ellipse(260, 160, 48, 32));
    s.add('jaw', 'Челюсть', ellipse(275, 186, 30, 12));
    s.add('eye', 'Глаз', circle(282, 148, 7));
    s.add('tooth', 'Зуб', [[250, 176], [256, 190], [262, 176]]);
    return s.done(meta);
  },
  'tri-friend': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('tail', 'Хвост', ribbon([[90, 230], [40, 210], [70, 250]], 16));
    s.add('body', 'Тело', ellipse(190, 220, 80, 46));
    s.add('frill', 'Воротник', ellipse(300, 150, 54, 40));
    s.add('head', 'Голова', ellipse(270, 170, 36, 26));
    s.add('horn-n', 'Рог', [[250, 150], [230, 110], [262, 156]]);
    s.add('horn-a', 'Рог', [[280, 130], [300, 90], [292, 140]]);
    s.add('horn-b', 'Рог', [[250, 128], [240, 96], [266, 132]]);
    s.add('eye', 'Глаз', circle(286, 164, 6));
    s.add('leg-a', 'Нога', ellipse(150, 270, 16, 24));
    s.add('leg-b', 'Нога', ellipse(210, 274, 16, 24));
    return s.done(meta);
  },
  'dino-family': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('body', 'Тело', ellipse(150, 210, 70, 40));
    s.add('neck', 'Шея', ribbon([[190, 190], [230, 140], [250, 110]], 16));
    s.add('head', 'Голова', ellipse(268, 100, 28, 18));
    s.add('eye', 'Глаз', circle(278, 96, 5));
    s.add('leg', 'Нога', ellipse(150, 260, 18, 22));
    s.add('baby-body', 'Малыш', ellipse(300, 250, 36, 22));
    s.add('baby-head', 'Голова малыша', circle(332, 230, 14));
    s.add('baby-eye', 'Глаз', circle(338, 228, 4));
    s.add('egg', 'Яйцо', ellipse(80, 280, 18, 24));
    return s.done(meta);
  },
  'dino-volcano': (meta) => {
    const s = new Sketch();
    s.dress('plain');
    s.add('ground', 'Земля', ellipse(200, 360, 220, 50));
    s.add('volcano', 'Вулкан', [[80, 320], [200, 80], [320, 320]]);
    s.add('lava', 'Лава', ellipse(200, 150, 28, 18));
    s.add('fern', 'Папоротник', ellipse(60, 300, 24, 16));
    s.add('dino', 'Динозаврик', ellipse(300, 300, 28, 16));
    s.add('dino-head', 'Голова', circle(328, 286, 10));
    return s.done(meta);
  },
  'stego-jungle': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('leaf-a', 'Лист', rotate(ellipse(60, 120, 40, 16), 60, 120, -30));
    s.add('leaf-b', 'Лист', rotate(ellipse(340, 100, 36, 14), 340, 100, 20));
    s.add('body', 'Тело', ellipse(200, 230, 100, 40));
    s.add('head', 'Голова', ellipse(310, 200, 32, 22));
    s.add('eye', 'Глаз', circle(324, 194, 5));
    for (let i = 0; i < 5; i += 1) s.add(`plate-${i}`, 'Пластина', [[120 + i * 28, 210], [134 + i * 28, 150 - (i % 2) * 16], [148 + i * 28, 210]]);
    s.add('tail', 'Хвост', ribbon([[100, 240], [50, 250], [30, 230]], 14));
    s.add('spike', 'Шип', [[40, 236], [16, 220], [36, 250]]);
    s.add('leg', 'Нога', ellipse(180, 280, 16, 22));
    return s.done(meta);
  },
  'doctor-kind': (meta) => person(meta, { hat: 'none', coatCross: true, prop: 'none', dress: 'room' }),
  'builder-house': (meta) => person(meta, { hat: 'hardhat', prop: 'hammer', dress: 'park' }),
  'firefighter-hero': (meta) => person(meta, { hat: 'fire', prop: 'hose', dress: 'park' }),
  'police-friend': (meta) => person(meta, { hat: 'police', prop: 'none', dress: 'park' }),
  'teacher-book': (meta) => person(meta, { hat: 'none', prop: 'book', dress: 'room', hair: 'bun' }),
  'chef-cake': (meta) => person(meta, { hat: 'chef', prop: 'cake', dress: 'room' }),
  'astro-job': (meta) => person(meta, { hat: 'astro', dress: 'space', prop: 'none' }),
  'apple-big': (meta) => {
    const s = new Sketch();
    s.dress('plain');
    s.add('ground', 'Земля', ellipse(200, 370, 140, 26));
    s.add('apple', 'Яблоко', circle(200, 210, 110));
    s.add('leaf', 'Листик', rotate(ellipse(230, 100, 28, 14), 230, 100, 30));
    s.add('stem', 'Черенок', ribbon([[200, 110], [214, 78]], 8));
    s.add('shine', 'Блик', ellipse(160, 180, 18, 10));
    return s.done(meta);
  },
  'fruit-bowl': (meta) => {
    const s = new Sketch();
    s.dress('room');
    s.add('bowl', 'Ваза', [[120, 220], [280, 220], [250, 320], [150, 320]]);
    s.add('apple', 'Яблоко', circle(170, 200, 28));
    s.add('orange', 'Апельсин', circle(220, 190, 26));
    s.add('pear', 'Груша', ellipse(250, 176, 20, 28));
    s.add('leaf', 'Лист', ellipse(250, 142, 12, 6));
    s.add('grape', 'Виноград', circle(140, 186, 12));
    return s.done(meta);
  },
  'veggie-friends': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('carrot', 'Морковка', [[90, 180], [130, 170], [110, 300]]);
    s.add('top', 'Ботва', ellipse(110, 160, 24, 14));
    s.add('tomato', 'Помидор', circle(210, 230, 40));
    s.add('tomato-leaf', 'Лист', ellipse(210, 184, 16, 8));
    s.add('pepper', 'Перец', ellipse(310, 220, 28, 46));
    s.add('eye-l', 'Глаз', circle(196, 224, 5));
    s.add('eye-r', 'Глаз', circle(222, 224, 5));
    s.decor(smile(210, 242, 12).points, 3);
    return s.done(meta);
  },
  'candy-jar': (meta) => {
    const s = new Sketch();
    s.dress('room');
    s.add('jar', 'Банка', roundRect(120, 120, 160, 180, 20));
    s.add('lid', 'Крышка', roundRect(110, 96, 180, 30, 8));
    s.add('candy-a', 'Конфета', rotate(roundRect(150, 160, 40, 18, 8), 170, 170, -20));
    s.add('candy-b', 'Конфета', rotate(roundRect(200, 190, 44, 18, 8), 220, 200, 16));
    s.add('candy-c', 'Конфета', ellipse(180, 240, 16, 12));
    s.add('candy-d', 'Конфета', heart(230, 230, 16));
    return s.done(meta);
  },
  'ice-cup': (meta) => {
    const s = new Sketch();
    s.dress('plain');
    s.add('cone', 'Рожок', [[160, 200], [240, 200], [200, 330]]);
    s.add('scoop-a', 'Шарик', circle(200, 180, 48));
    s.add('scoop-b', 'Шарик', circle(200, 130, 36));
    s.add('cherry', 'Вишенка', circle(214, 92, 10));
    s.add('stripe', 'Полоска', [[172, 230], [228, 230], [220, 246], [180, 246]]);
    return s.done(meta);
  },
  'cake-party': (meta) => {
    const s = new Sketch();
    s.dress('room');
    s.add('plate', 'Тарелка', ellipse(200, 300, 120, 24));
    s.add('cake', 'Корж', roundRect(110, 180, 180, 100, 16));
    s.add('frost', 'Крем', ellipse(200, 180, 90, 24));
    s.add('drip', 'Капля', ellipse(150, 200, 10, 16));
    s.add('cherry', 'Вишенка', circle(200, 150, 12));
    s.add('candle', 'Свеча', rect(236, 130, 10, 40));
    s.add('flame', 'Огонёк', ellipse(241, 118, 6, 10));
    return s.done(meta);
  },
  'pizza-slice': (meta) => {
    const s = new Sketch();
    s.dress('room');
    s.add('plate', 'Тарелка', circle(200, 210, 130));
    for (let i = 0; i < 4; i += 1) {
      const a0 = (i / 4) * Math.PI * 2 - 0.2;
      const a1 = ((i + 1) / 4) * Math.PI * 2 - 0.2;
      s.add(`slice-${i}`, 'Кусочек', [
        [200, 210],
        [200 + Math.cos(a0) * 110, 210 + Math.sin(a0) * 110],
        [200 + Math.cos((a0 + a1) / 2) * 110, 210 + Math.sin((a0 + a1) / 2) * 110],
        [200 + Math.cos(a1) * 110, 210 + Math.sin(a1) * 110],
      ]);
    }
    s.add('olive', 'Оливка', circle(230, 180, 8));
    s.add('tomato', 'Помидор', circle(170, 200, 10));
    return s.done(meta);
  },
  'donut-smile': (meta) => {
    const s = new Sketch();
    s.dress('plain');
    s.add('dough', 'Пончик', circle(200, 200, 110));
    s.add('icing', 'Глазурь', circle(200, 190, 96));
    s.add('hole', 'Дырка', circle(200, 210, 36));
    s.add('eye-l', 'Глаз', circle(176, 170, 8));
    s.add('eye-r', 'Глаз', circle(224, 170, 8));
    s.add('sprinkle-a', 'Посыпка', rect(150, 150, 16, 6));
    s.add('sprinkle-b', 'Посыпка', rect(230, 146, 16, 6));
    s.decor(smile(200, 188, 18).points, 4);
    return s.done(meta);
  },
  'tree-gifts': (meta) => {
    const s = new Sketch();
    s.dress('snow');
    s.add('tier-a', 'Ветка', [[200, 40], [120, 150], [280, 150]]);
    s.add('tier-b', 'Ветка', [[200, 120], [90, 230], [310, 230]]);
    s.add('tier-c', 'Ветка', [[200, 190], [70, 310], [330, 310]]);
    s.add('trunk', 'Ствол', rect(184, 310, 32, 40));
    s.add('star', 'Звезда', star(200, 36, 18, 8));
    s.add('ball-a', 'Шарик', circle(160, 180, 12));
    s.add('ball-b', 'Шарик', circle(240, 210, 12));
    s.add('gift', 'Подарок', roundRect(80, 300, 40, 36, 4));
    return s.done(meta);
  },
  'snowman-hat': (meta) => {
    const s = new Sketch();
    s.dress('snow');
    s.add('bottom', 'Низ', circle(200, 280, 70));
    s.add('middle', 'Середина', circle(200, 190, 52));
    s.add('head', 'Голова', circle(200, 112, 36));
    s.add('hat-brim', 'Поля', ellipse(200, 84, 48, 10));
    s.add('hat', 'Шляпа', roundRect(176, 36, 48, 46, 6));
    s.add('eye-l', 'Глаз', circle(186, 108, 5));
    s.add('eye-r', 'Глаз', circle(214, 108, 5));
    s.add('nose', 'Нос', [[200, 116], [232, 124], [200, 128]]);
    s.add('button-a', 'Пуговица', circle(200, 180, 6));
    s.add('button-b', 'Пуговица', circle(200, 204, 6));
    s.add('scarf', 'Шарф', ellipse(200, 148, 40, 12));
    return s.done(meta);
  },
  'gift-party': (meta) => {
    const s = new Sketch();
    s.dress('room');
    s.add('box', 'Коробка', roundRect(100, 150, 200, 160, 8));
    s.add('lid', 'Крышка', roundRect(90, 120, 220, 40, 8));
    s.add('ribbon-v', 'Лента', rect(186, 120, 28, 190));
    s.add('ribbon-h', 'Лента', rect(100, 210, 200, 24));
    s.add('bow-l', 'Бант', ellipse(170, 110, 28, 16));
    s.add('bow-r', 'Бант', ellipse(230, 110, 28, 16));
    return s.done(meta);
  },
  'pumpkin-smile': (meta) => {
    const s = new Sketch();
    s.dress('night');
    s.add('body', 'Тыква', ellipse(200, 220, 110, 90));
    s.add('ridge-l', 'Долька', ellipse(150, 220, 28, 84));
    s.add('ridge-r', 'Долька', ellipse(250, 220, 28, 84));
    s.add('stem', 'Стебель', ribbon([[200, 130], [220, 80]], 12));
    s.add('eye-l', 'Глаз', [[150, 190], [180, 190], [165, 214]]);
    s.add('eye-r', 'Глаз', [[220, 190], [250, 190], [235, 214]]);
    s.add('mouth', 'Рот', [[150, 250], [200, 280], [250, 250], [200, 262]]);
    return s.done(meta);
  },
  'spring-basket': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('basket', 'Корзина', [[110, 200], [290, 200], [260, 320], [140, 320]]);
    s.add('handle', 'Ручка', ribbon([[130, 200], [200, 120], [270, 200]], 10));
    bloom(s, 'a', 160, 190, 18);
    bloom(s, 'b', 220, 176, 16);
    bloom(s, 'c', 200, 210, 14);
    return s.done(meta);
  },
  'summer-kite': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('kite', 'Змей', [[200, 60], [280, 150], [200, 250], [120, 150]]);
    s.add('cross-v', 'Планка', rect(194, 80, 12, 150));
    s.add('cross-h', 'Планка', rect(140, 144, 120, 12));
    s.add('bow', 'Бант', ellipse(200, 250, 16, 10));
    s.add('tail', 'Хвост', ribbon([[200, 260], [230, 300], [190, 330]], 8));
    s.add('puff', 'Облако', ellipse(80, 90, 36, 16));
    return s.done(meta);
  },
  'mitten-pair': (meta) => {
    const s = new Sketch();
    s.dress('snow');
    s.add('mit-l', 'Варежка', roundRect(70, 120, 100, 140, 40));
    s.add('thumb-l', 'Большой палец', ellipse(70, 200, 22, 28));
    s.add('cuff-l', 'Манжета', rect(78, 230, 84, 28));
    s.add('mit-r', 'Варежка', roundRect(220, 120, 100, 140, 40));
    s.add('thumb-r', 'Большой палец', ellipse(320, 200, 22, 28));
    s.add('cuff-r', 'Манжета', rect(228, 230, 84, 28));
    return s.done(meta);
  },
  'easter-egg': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('egg', 'Яйцо', ellipse(200, 200, 90, 120));
    s.add('band', 'Полоска', ellipse(200, 200, 90, 16));
    s.add('dot-a', 'Горошина', circle(160, 150, 10));
    s.add('dot-b', 'Горошина', circle(230, 160, 10));
    s.add('dot-c', 'Горошина', circle(180, 250, 10));
    s.add('flower', 'Цветок', circle(220, 240, 14));
    return s.done(meta);
  },
  'soccer-ball': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('goal-l', 'Штанга', rect(40, 80, 10, 200));
    s.add('goal-r', 'Штанга', rect(250, 80, 10, 200));
    s.add('crossbar', 'Перекладина', rect(40, 80, 220, 10));
    s.add('net', 'Сетка', rect(50, 90, 200, 180));
    s.add('ball', 'Мяч', circle(150, 300, 36));
    s.add('patch', 'Пятак', circle(150, 292, 12));
    return s.done(meta);
  },
  'basket-shot': (meta) => {
    const s = new Sketch();
    s.dress('room');
    s.add('board', 'Щит', roundRect(140, 40, 120, 90, 8));
    s.add('rim', 'Кольцо', ellipse(200, 140, 36, 10));
    s.add('net', 'Сетка', [[170, 146], [230, 146], [214, 200], [186, 200]]);
    s.add('ball', 'Мяч', circle(200, 260, 40));
    s.add('line', 'Полоска', ellipse(200, 250, 40, 8));
    return s.done(meta);
  },
  'bike-ride': (meta) => {
    const s = new Sketch();
    s.dress('park');
    wheel(s, 'w1', 110, 250, 48);
    wheel(s, 'w2', 290, 250, 48);
    s.add('frame-a', 'Рама', ribbon([[110, 250], [180, 170], [250, 190]], 8));
    s.add('frame-b', 'Рама', ribbon([[180, 170], [290, 250]], 8));
    s.add('seat', 'Сиденье', ellipse(176, 156, 22, 8));
    s.add('bar', 'Руль', ribbon([[250, 190], [270, 140], [300, 136]], 8));
    s.add('pedal', 'Педаль', rect(168, 230, 20, 8));
    return s.done(meta);
  },
  'toy-blocks': (meta) => {
    const s = new Sketch();
    s.dress('room');
    s.add('block-a', 'Кубик', roundRect(80, 180, 80, 80, 8));
    s.add('block-b', 'Кубик', roundRect(150, 140, 70, 70, 8));
    s.add('block-c', 'Кубик', roundRect(200, 200, 90, 70, 8));
    s.add('ball', 'Мячик', circle(320, 230, 36));
    s.add('star', 'Звезда', star(110, 150, 16, 7));
    return s.done(meta);
  },
  'board-fun': (meta) => {
    const s = new Sketch();
    s.dress('room');
    s.add('table', 'Стол', roundRect(40, 180, 320, 140, 12));
    s.add('board', 'Поле', roundRect(70, 200, 180, 100, 8));
    s.add('cell-a', 'Клетка', rect(86, 214, 28, 28));
    s.add('cell-b', 'Клетка', rect(122, 214, 28, 28));
    s.add('piece-a', 'Фишка', circle(300, 230, 16));
    s.add('piece-b', 'Фишка', circle(330, 260, 14));
    s.add('die', 'Кубик', roundRect(250, 230, 28, 28, 4));
    return s.done(meta);
  },
  'sport-kid': (meta) => person(meta, { dress: 'park', hat: 'cap', prop: 'ball' }),
  'duck-family': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('mom-body', 'Мама', ellipse(150, 230, 50, 32));
    s.add('mom-head', 'Голова', circle(196, 200, 20));
    s.add('mom-beak', 'Клюв', [[214, 200], [236, 208], [214, 216]]);
    s.add('mom-eye', 'Глаз', circle(202, 194, 4));
    s.add('kid-a', 'Утёнок', ellipse(270, 250, 28, 18));
    s.add('kid-a-head', 'Голова', circle(294, 236, 12));
    s.add('kid-a-beak', 'Клюв', [[304, 236], [318, 242], [304, 246]]);
    s.add('kid-b', 'Утёнок', ellipse(320, 280, 24, 16));
    s.add('kid-b-head', 'Голова', circle(340, 268, 10));
    return s.done(meta);
  },
  'fantasy-blob': (meta) => {
    const s = new Sketch();
    s.dress('park');
    s.add('body', 'Тело', ellipse(200, 210, 90, 70));
    s.add('ear-l', 'Ушко', ellipse(130, 150, 22, 30));
    s.add('ear-r', 'Ушко', ellipse(270, 146, 20, 34));
    s.add('belly', 'Живот', ellipse(200, 230, 48, 36));
    s.add('eye-l', 'Глаз', circle(170, 190, 14));
    s.add('eye-r', 'Глаз', circle(230, 190, 14));
    s.add('pupil-l', 'Зрачок', circle(174, 192, 6));
    s.add('pupil-r', 'Зрачок', circle(234, 192, 6));
    s.add('cheek', 'Щека', circle(150, 214, 10));
    s.add('arm', 'Лапка', ellipse(300, 220, 20, 12));
    s.add('star', 'Звезда', star(320, 120, 16, 7));
    s.decor(smile(200, 214, 16).points, 3);
    return s.done(meta);
  },
};
