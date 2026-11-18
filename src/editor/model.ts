export type ToolName =
  | 'brush'
  | 'pencil'
  | 'marker'
  | 'watercolor'
  | 'bucket'
  | 'eraser'
  | 'rainbow'
  | 'glitter'
  | 'spray'
  | 'sticker'
  | 'pan';

export type BackgroundId = 'white' | 'blue' | 'pink' | 'lavender' | 'sunset';
export type StickerKind = 'star' | 'heart' | 'cloud' | 'flower' | 'butterfly' | 'smile';

export type Sticker = {
  id: string;
  kind: StickerKind;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  color: string;
};

export type DrawOp =
  | {
      kind: 'stroke';
      tool: 'brush' | 'pencil' | 'marker' | 'watercolor' | 'rainbow' | 'glitter' | 'spray';
      color: string;
      size: number;
      alpha: number;
      points: Array<{ x: number; y: number }>;
      contour: boolean;
      hue: number;
    }
  | {
      kind: 'erase';
      size: number;
      points: Array<{ x: number; y: number }>;
      contour: boolean;
      toBackground: boolean;
    }
  | { kind: 'fill'; regionId: string; color: string | null }
  | { kind: 'sticker-add'; sticker: Sticker }
  | { kind: 'sticker-update'; id: string; patch: Partial<Pick<Sticker, 'x' | 'y' | 'scale' | 'rotation'>> }
  | { kind: 'sticker-delete'; id: string };

export const RES = 800;

export const backgrounds: Array<{ id: BackgroundId; title: string }> = [
  { id: 'white', title: 'Белый' },
  { id: 'blue', title: 'Голубой' },
  { id: 'pink', title: 'Розовый' },
  { id: 'lavender', title: 'Лавандовый' },
  { id: 'sunset', title: 'Градиент' },
];

export const backgroundPaint = (id: BackgroundId, ctx: CanvasRenderingContext2D, size: number) => {
  if (id === 'blue') ctx.fillStyle = '#d9f3ff';
  else if (id === 'pink') ctx.fillStyle = '#ffe3ef';
  else if (id === 'lavender') ctx.fillStyle = '#eee6ff';
  else if (id === 'sunset') {
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, '#ffe7f2');
    gradient.addColorStop(0.55, '#fff6d8');
    gradient.addColorStop(1, '#e7f6ff');
    ctx.fillStyle = gradient;
  } else ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
};

export const backgroundCss = (id: BackgroundId): string => {
  if (id === 'blue') return '#d9f3ff';
  if (id === 'pink') return '#ffe3ef';
  if (id === 'lavender') return '#eee6ff';
  if (id === 'sunset') return 'linear-gradient(180deg, #ffe7f2 0%, #fff6d8 55%, #e7f6ff 100%)';
  return '#ffffff';
};
