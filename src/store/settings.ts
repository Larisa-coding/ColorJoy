import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PraiseFrequency = 'low' | 'normal' | 'high';
export type MotionMode = 'system' | 'full' | 'reduced';

type Resume = { pageId: string; drawingId: string } | null;

type SettingsState = {
  sound: boolean;
  music: boolean;
  volume: number;
  praise: boolean;
  praiseFrequency: PraiseFrequency;
  motion: MotionMode;
  kidMode: boolean;
  contour: boolean;
  debugRegions: boolean;
  favoritePages: string[];
  favoriteColors: string[];
  resume: Resume;
  set: (patch: Partial<Omit<SettingsState, 'set' | 'togglePage' | 'toggleColor'>>) => void;
  togglePage: (id: string) => void;
  toggleColor: (hex: string) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      sound: true,
      music: false,
      volume: 0.7,
      praise: true,
      praiseFrequency: 'normal',
      motion: 'system',
      kidMode: true,
      contour: true,
      debugRegions: false,
      favoritePages: [],
      favoriteColors: [],
      resume: null,
      set: (patch) => set(patch),
      togglePage: (id) => {
        const list = get().favoritePages;
        set({ favoritePages: list.includes(id) ? list.filter((item) => item !== id) : [...list, id] });
      },
      toggleColor: (hex) => {
        const list = get().favoriteColors;
        set({ favoriteColors: list.includes(hex) ? list.filter((item) => item !== hex) : [...list, hex] });
      },
    }),
    { name: 'colorjoy:settings', version: 1 },
  ),
);

export const praiseEvery = (frequency: PraiseFrequency): number => {
  if (frequency === 'low') return 8;
  if (frequency === 'high') return 2;
  return 4;
};
