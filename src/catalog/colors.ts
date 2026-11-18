export type ColorGroup =
  | 'basic'
  | 'pastel'
  | 'bright'
  | 'rainbow'
  | 'nature'
  | 'warm'
  | 'cool'
  | 'neon'
  | 'metal'
  | 'favorite';

export type Swatch = { id: string; name: string; hex: string; group: ColorGroup };

const swatch = (group: ColorGroup, name: string, hex: string): Swatch => ({
  id: `${group}-${hex.slice(1)}`,
  name,
  hex,
  group,
});

export const palette: Swatch[] = [
  swatch('basic', 'Красный', '#ef3b3b'),
  swatch('basic', 'Оранжевый', '#ff8a1e'),
  swatch('basic', 'Жёлтый', '#ffd000'),
  swatch('basic', 'Зелёный', '#22b85a'),
  swatch('basic', 'Голубой', '#2f9dff'),
  swatch('basic', 'Синий', '#335dff'),
  swatch('basic', 'Фиолетовый', '#7a45e0'),
  swatch('basic', 'Розовый', '#ff5d8f'),
  swatch('basic', 'Коричневый', '#8a5a3b'),
  swatch('basic', 'Чёрный', '#2a2a2a'),
  swatch('basic', 'Белый', '#ffffff'),
  swatch('basic', 'Серый', '#b9b9c4'),

  swatch('pastel', 'Пудра', '#ffd6e3'),
  swatch('pastel', 'Персик', '#ffd8c2'),
  swatch('pastel', 'Крем', '#fff1c9'),
  swatch('pastel', 'Мята', '#d7f6e4'),
  swatch('pastel', 'Небо', '#d7efff'),
  swatch('pastel', 'Лаванда', '#e4dcff'),
  swatch('pastel', 'Сирень', '#f3dff8'),
  swatch('pastel', 'Молоко', '#fff7f1'),

  swatch('bright', 'Арбуз', '#ff4d6d'),
  swatch('bright', 'Мандарин', '#ff7a00'),
  swatch('bright', 'Лимон', '#ffe14a'),
  swatch('bright', 'Лайм', '#8be04a'),
  swatch('bright', 'Бирюза', '#1ec8c8'),
  swatch('bright', 'Аква', '#3dc2ff'),
  swatch('bright', 'Фуксия', '#e23ca8'),
  swatch('bright', 'Виноград', '#7b4dff'),

  swatch('rainbow', 'Красный', '#ff3b30'),
  swatch('rainbow', 'Алый', '#ff5a1f'),
  swatch('rainbow', 'Янтарь', '#ffb000'),
  swatch('rainbow', 'Золото', '#f5d000'),
  swatch('rainbow', 'Зелень', '#34c759'),
  swatch('rainbow', 'Море', '#00b4d8'),
  swatch('rainbow', 'Индиго', '#4361ee'),
  swatch('rainbow', 'Пурпур', '#9b5de5'),

  swatch('nature', 'Лист', '#3f8f4e'),
  swatch('nature', 'Мох', '#7ea35a'),
  swatch('nature', 'Земля', '#a56b43'),
  swatch('nature', 'Кора', '#6e4b32'),
  swatch('nature', 'Небо', '#8ec9ef'),
  swatch('nature', 'Трава', '#b7d96a'),
  swatch('nature', 'Ягода', '#c43b4e'),
  swatch('nature', 'Песок', '#efd2a4'),

  swatch('warm', 'Коралл', '#ff7f73'),
  swatch('warm', 'Терракота', '#e36a45'),
  swatch('warm', 'Мед', '#e8a317'),
  swatch('warm', 'Абрикос', '#ffb085'),
  swatch('warm', 'Роза', '#e36b8a'),
  swatch('warm', 'Какао', '#6b4334'),

  swatch('cool', 'Лёд', '#d9f4ff'),
  swatch('cool', 'Синева', '#5aa7ff'),
  swatch('cool', 'Глубина', '#2d4b9b'),
  swatch('cool', 'Мята', '#5ed0b5'),
  swatch('cool', 'Чернила', '#314e7a'),
  swatch('cool', 'Фиалка', '#8e7cc3'),

  swatch('neon', 'Неон-розовый', '#ff4fd8'),
  swatch('neon', 'Неон-лайм', '#c6ff3a'),
  swatch('neon', 'Неон-голубой', '#3dfff3'),
  swatch('neon', 'Неон-оранж', '#ff9e2c'),
  swatch('neon', 'Неон-фиолет', '#b15cff'),

  swatch('metal', 'Серебро', '#d9dde6'),
  swatch('metal', 'Золото', '#e3c16f'),
  swatch('metal', 'Бронза', '#c48a55'),
  swatch('metal', 'Сталь', '#8e98a8'),
  swatch('metal', 'Медь', '#d4846a'),
];

export const colorGroups: Array<{ id: ColorGroup; title: string }> = [
  { id: 'basic', title: 'Основные' },
  { id: 'pastel', title: 'Пастель' },
  { id: 'bright', title: 'Яркие' },
  { id: 'rainbow', title: 'Радуга' },
  { id: 'nature', title: 'Природа' },
  { id: 'warm', title: 'Тёплые' },
  { id: 'cool', title: 'Холодные' },
  { id: 'neon', title: 'Неон' },
  { id: 'metal', title: 'Металл' },
  { id: 'favorite', title: 'Любимые' },
];

export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
};

export const withAlpha = (hex: string, alpha: number): string => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const rgbToHex = (r: number, g: number, b: number): string =>
  `#${[r, g, b].map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0')).join('')}`;

export const hslToHex = (h: number, s: number, l: number): string => {
  const sat = s / 100;
  const light = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
};

export const shiftHex = (hex: string, amount: number): string => {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + amount, g + amount * 0.4, b - amount * 0.2);
};
