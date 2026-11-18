export type Difficulty = 'very-easy' | 'easy' | 'medium' | 'detailed';
export type AgeGroup = '3-5' | '4-7' | '6-9' | '8-12';

export type Group =
  | 'animals'
  | 'nature'
  | 'space'
  | 'transport'
  | 'robots'
  | 'fairy'
  | 'dinos'
  | 'jobs'
  | 'food'
  | 'holidays'
  | 'sports'
  | 'cute';

export type Pt = [number, number];

export type Region = {
  id: string;
  name: string;
  points: Pt[];
  d: string;
  area: number;
  bbox: { minX: number; minY: number; maxX: number; maxY: number };
};

export type Decor = { points: Pt[]; width?: number };

export type RegionInput = { id: string; name: string; points: Pt[] };

export type PageGeometry = {
  strokeWidth: number;
  regions: Region[];
  decors: Decor[];
};

export type PageMeta = {
  id: string;
  title: string;
  collectionId: string;
  group: Group;
  difficulty: Difficulty;
  age: AgeGroup;
};

export type ColoringPage = PageMeta &
  PageGeometry & {
    author: string;
    license: 'original';
  };

export const ART = 400;

export const strokeFor = (difficulty: Difficulty): number => {
  if (difficulty === 'very-easy') return 11;
  if (difficulty === 'easy') return 8.5;
  if (difficulty === 'medium') return 6.5;
  return 5;
};
