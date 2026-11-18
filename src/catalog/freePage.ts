import { finalize, rect } from './geometry';
import type { ColoringPage } from './types';
import { appConfig } from '@/config';

export const freePage: ColoringPage = {
  id: 'free-draw',
  title: 'Свой рисунок',
  collectionId: 'free',
  group: 'cute',
  difficulty: 'easy',
  age: '3-5',
  strokeWidth: 0,
  regions: finalize([{ id: 'paper', name: 'Лист', points: rect(0, 0, 400, 400) }]),
  decors: [],
  author: appConfig.name,
  license: 'original',
};
