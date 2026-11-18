import { create } from 'zustand';

const lines = [
  'Ух ты, как красиво!',
  'Ты настоящий художник!',
  'Здорово получается!',
  'Какой красивый цвет!',
  'Вау! Мне нравится!',
  'Ты большой молодец!',
  'Получается настоящий шедевр!',
  'Как здорово ты придумал!',
  'Продолжай, у тебя отлично получается!',
  'Супер!',
];

let timer = 0;

export const usePraise = create<{ text: string | null; show: (text?: string) => void; hide: () => void }>((set) => ({
  text: null,
  hide: () => set({ text: null }),
  show: (text) => {
    window.clearTimeout(timer);
    const line = text ?? lines[Math.floor(Math.random() * lines.length)];
    set({ text: line });
    timer = window.setTimeout(() => set({ text: null }), 2600);
  },
}));
