import type { AgeGroup, Difficulty } from './types';

export const difficultyLabel: Record<Difficulty, string> = {
  'very-easy': 'Очень легко',
  easy: 'Легко',
  medium: 'Средне',
  detailed: 'Подробно',
};

export const ageLabel: Record<AgeGroup, string> = {
  '3-5': '3–5 лет',
  '4-7': '4–7 лет',
  '6-9': '6–9 лет',
  '8-12': '8–12 лет',
};

export const normalizeSearch = (value: string): string => value.toLowerCase().replaceAll('ё', 'е').trim();

export const picturesLabel = (count: number): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} картинка`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} картинки`;
  return `${count} картинок`;
};
