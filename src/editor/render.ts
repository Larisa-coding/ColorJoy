import { hitTest } from '@/catalog/hit';
import { buildTopology } from '@/catalog/topology';
import { ART, type ColoringPage, type Pt } from '@/catalog/types';
import { hslToHex, withAlpha } from '@/catalog/colors';
import { cloud, ellipse, heart, star } from '@/catalog/geometry';
import { hash, type Point } from './sample';
import { backgroundPaint, type BackgroundId, type DrawOp, type Sticker } from './model';

type Prep = { path: Path2D; evenodd: Path2D };

export type Scene = {
  page: ColoringPage;
  scale: number;
  prep: Map<string, Prep>;
  children: Map<string, string[]>;
};

const pathOf = (points: Pt[], scale: number): Path2D => {
  const path = new Path2D();
  points.forEach(([x, y], index) => {
    const sx = x * scale;
    const sy = y * scale;
    if (index === 0) path.moveTo(sx, sy);
    else path.lineTo(sx, sy);
  });
  path.closePath();
  return path;
};

export const prepareScene = (page: ColoringPage, scale: number): Scene => {
  const topology = buildTopology(page.regions);
  const prep = new Map<string, Prep>();
  for (const region of page.regions) {
    const path = pathOf(region.points, scale);
    const evenodd = new Path2D();
    evenodd.addPath(path);
    for (const childId of topology.children.get(region.id) ?? []) {
      const child = page.regions.find((item) => item.id === childId);
      if (child) evenodd.addPath(pathOf(child.points, scale));
    }
    prep.set(region.id, { path, evenodd });
  }
  return { page, scale, prep, children: topology.children };
};

const clipExclusive = (ctx: CanvasRenderingContext2D, scene: Scene, regionId: string) => {
  const item = scene.prep.get(regionId);
  if (!item) return;
  ctx.clip(item.path);
  if ((scene.children.get(regionId) ?? []).length > 0) ctx.clip(item.evenodd, 'evenodd');
};

const spacingFor = (tool: string, radius: number) => {
  if (tool === 'pencil') return Math.max(0.7, radius * 0.34);
  if (tool === 'watercolor') return Math.max(1.2, radius * 0.18);
  if (tool === 'spray' || tool === 'glitter') return Math.max(2, radius * 0.4);
  return Math.max(0.8, radius * 0.2);
};

export const spacingOf = spacingFor;

const stamp = (
  ctx: CanvasRenderingContext2D,
  tool: string,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha: number,
  index: number,
) => {
  ctx.beginPath();
  if (tool === 'brush' || tool === 'watercolor') {
    const gradient = ctx.createRadialGradient(x, y, radius * 0.12, x, y, radius);
    gradient.addColorStop(0, withAlpha(color, alpha));
    gradient.addColorStop(0.7, withAlpha(color, alpha * (tool === 'watercolor' ? 0.35 : 0.5)));
    gradient.addColorStop(1, withAlpha(color, 0));
    ctx.fillStyle = gradient;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    if (tool === 'watercolor') {
      const ox = (hash(index) - 0.5) * radius * 0.45;
      const oy = (hash(index + 3) - 0.5) * radius * 0.45;
      const soft = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, radius * 0.8);
      soft.addColorStop(0, withAlpha(color, alpha * 0.65));
      soft.addColorStop(1, withAlpha(color, 0));
      ctx.fillStyle = soft;
      ctx.beginPath();
      ctx.arc(x + ox, y + oy, radius * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }
  if (tool === 'pencil') {
    ctx.globalAlpha = alpha * (0.45 + hash(index) * 0.5);
    ctx.fillStyle = color;
    ctx.arc(x + (hash(index + 1) - 0.5) * radius * 0.4, y + (hash(index + 2) - 0.5) * radius * 0.4, radius * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    return;
  }
  if (tool === 'glitter') {
    for (let i = 0; i < 5; i += 1) {
      const angle = hash(index + i * 5) * Math.PI * 2;
      const dist = hash(index + i * 2) * radius;
      ctx.globalAlpha = 0.45 + hash(index + i) * 0.55;
      ctx.fillStyle = i % 2 ? '#fff6c2' : color;
      ctx.beginPath();
      ctx.arc(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, Math.max(1.2, radius * 0.12), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    return;
  }
  if (tool === 'spray') {
    for (let i = 0; i < 12; i += 1) {
      const angle = hash(index + i * 4) * Math.PI * 2;
      const dist = Math.sqrt(hash(index + i * 9)) * radius;
      ctx.globalAlpha = alpha * (0.25 + hash(index + i));
      ctx.fillStyle = color;
      ctx.fillRect(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, Math.max(1, radius * 0.08), Math.max(1, radius * 0.08));
    }
    ctx.globalAlpha = 1;
    return;
  }
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
};

const paintPoint = (
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  point: Point,
  index: number,
  tool: string,
  color: string,
  size: number,
  alpha: number,
  contour: boolean,
  hue: number,
  erase: boolean,
) => {
  const region = contour ? hitTest(scene.page.regions, point.x, point.y) : null;
  if (contour && !region) return;
  ctx.save();
  if (region) clipExclusive(ctx, scene, region.id);
  if (erase) ctx.globalCompositeOperation = 'destination-out';
  const radius = Math.max(1, size * scene.scale);
  const ink = tool === 'rainbow' ? hslToHex((hue + index * 11) % 360, 82, 54) : color;
  stamp(ctx, erase ? 'marker' : tool, point.x * scene.scale, point.y * scene.scale, radius, ink, erase ? 1 : alpha, index + 1);
  ctx.restore();
};

export const drawOp = (fill: CanvasRenderingContext2D, paint: CanvasRenderingContext2D, scene: Scene, op: DrawOp) => {
  if (op.kind === 'fill') {
    const ctx = fill;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    clipExclusive(ctx, scene, op.regionId);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, scene.scale * ART, scene.scale * ART);
    ctx.restore();
    if (op.color) {
      ctx.save();
      clipExclusive(ctx, scene, op.regionId);
      ctx.fillStyle = op.color;
      ctx.fillRect(0, 0, scene.scale * ART, scene.scale * ART);
      ctx.restore();
    }
    return;
  }
  if (op.kind === 'stroke') {
    op.points.forEach((point, index) => {
      paintPoint(paint, scene, point, index, op.tool, op.color, op.size, op.alpha, op.contour, op.hue, false);
    });
    return;
  }
  if (op.kind === 'erase') {
    op.points.forEach((point, index) => {
      paintPoint(paint, scene, point, index, 'eraser', '#000', op.size, 1, op.contour, 0, true);
      if (op.toBackground) paintPoint(fill, scene, point, index, 'eraser', '#000', op.size, 1, op.contour, 0, true);
    });
  }
};

export const replay = (fill: CanvasRenderingContext2D, paint: CanvasRenderingContext2D, scene: Scene, ops: DrawOp[]) => {
  const size = scene.scale * ART;
  fill.clearRect(0, 0, size, size);
  paint.clearRect(0, 0, size, size);
  for (const op of ops) drawOp(fill, paint, scene, op);
};

export const stickersFrom = (ops: DrawOp[]): Sticker[] => {
  const list: Sticker[] = [];
  for (const op of ops) {
    if (op.kind === 'sticker-add') list.push({ ...op.sticker });
    if (op.kind === 'sticker-update') {
      const sticker = list.find((item) => item.id === op.id);
      if (sticker) Object.assign(sticker, op.patch);
    }
    if (op.kind === 'sticker-delete') {
      const index = list.findIndex((item) => item.id === op.id);
      if (index >= 0) list.splice(index, 1);
    }
  }
  return list;
};

export const strokeOutlines = (ctx: CanvasRenderingContext2D, page: ColoringPage, scale: number) => {
  if (page.strokeWidth <= 0) return;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#1b1724';
  ctx.lineWidth = page.strokeWidth * scale;
  ctx.miterLimit = 2;
  for (const region of page.regions) {
    ctx.beginPath();
    region.points.forEach(([x, y], index) => {
      if (index === 0) ctx.moveTo(x * scale, y * scale);
      else ctx.lineTo(x * scale, y * scale);
    });
    ctx.closePath();
    ctx.stroke();
  }
  for (const decor of page.decors) {
    if (decor.points.length < 2) continue;
    ctx.beginPath();
    ctx.lineWidth = (decor.width ?? page.strokeWidth * 0.45) * scale;
    decor.points.forEach(([x, y], index) => {
      if (index === 0) ctx.moveTo(x * scale, y * scale);
      else ctx.lineTo(x * scale, y * scale);
    });
    ctx.stroke();
  }
  ctx.restore();
};

export const drawSticker = (ctx: CanvasRenderingContext2D, sticker: Sticker, scale: number) => {
  ctx.save();
  ctx.translate(sticker.x * scale, sticker.y * scale);
  ctx.rotate(sticker.rotation);
  ctx.scale(sticker.scale * scale, sticker.scale * scale);
  ctx.fillStyle = sticker.color;
  const poly = (points: Pt[]) => {
    ctx.beginPath();
    points.forEach(([x, y], index) => (index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.closePath();
    ctx.fill();
  };
  if (sticker.kind === 'star') poly(star(0, 0, 16, 7));
  else if (sticker.kind === 'heart') poly(heart(0, 2, 18));
  else if (sticker.kind === 'cloud') poly(cloud(0, 0, 0.34));
  else if (sticker.kind === 'flower') {
    for (let i = 0; i < 5; i += 1) {
      const angle = (i / 5) * Math.PI * 2;
      poly(ellipse(Math.cos(angle) * 8, Math.sin(angle) * 8, 7, 4));
    }
    ctx.fillStyle = '#fff3b0';
    poly(ellipse(0, 0, 4, 4));
  } else if (sticker.kind === 'butterfly') {
    poly(ellipse(-8, -2, 10, 7));
    poly(ellipse(8, -2, 10, 7));
    ctx.fillStyle = '#2d2740';
    poly(ellipse(0, 0, 2, 10));
  } else {
    poly(ellipse(0, 0, 14, 14));
    ctx.fillStyle = '#2d2740';
    ctx.beginPath();
    ctx.arc(-5, -2, 1.6, 0, Math.PI * 2);
    ctx.arc(5, -2, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

export const composite = (
  ctx: CanvasRenderingContext2D,
  size: number,
  background: BackgroundId,
  fill: HTMLCanvasElement,
  paint: HTMLCanvasElement,
  page: ColoringPage,
  stickers: Sticker[],
) => {
  backgroundPaint(background, ctx, size);
  ctx.drawImage(fill, 0, 0, size, size);
  ctx.drawImage(paint, 0, 0, size, size);
  strokeOutlines(ctx, page, size / ART);
  for (const sticker of stickers) drawSticker(ctx, sticker, size / ART);
};

export const liveSpacing = (tool: string, size: number) => spacingFor(tool, size);

export const renderPng = async (page: ColoringPage, ops: DrawOp[], background: BackgroundId): Promise<Blob> => {
  const size = 1600;
  const fill = document.createElement('canvas');
  const paint = document.createElement('canvas');
  const out = document.createElement('canvas');
  fill.width = size;
  fill.height = size;
  paint.width = size;
  paint.height = size;
  out.width = size;
  out.height = size;
  const fillCtx = fill.getContext('2d');
  const paintCtx = paint.getContext('2d');
  const outCtx = out.getContext('2d');
  if (!fillCtx || !paintCtx || !outCtx) throw new Error('Не удалось собрать картинку');
  const scene = prepareScene(page, size / ART);
  replay(fillCtx, paintCtx, scene, ops);
  composite(outCtx, size, background, fill, paint, page, stickersFrom(ops));
  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Не удалось сохранить изображение');
  return blob;
};

export { paintPoint };
