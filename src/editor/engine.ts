import { hitTest } from '@/catalog/hit';
import type { ColoringPage } from '@/catalog/types';
import { sampleSegment, type Point } from './sample';
import { OpHistory } from './history';
import {
  composite,
  drawOp,
  liveSpacing,
  paintPoint,
  prepareScene,
  replay,
  stickersFrom,
  type Scene,
} from './render';
import { RES, type BackgroundId, type DrawOp, type Sticker, type ToolName } from './model';

export type StrokeStyle = {
  tool: ToolName;
  color: string;
  size: number;
  alpha: number;
  contour: boolean;
  toBackground: boolean;
  hue: number;
};

type Draft = StrokeStyle & { points: Point[] };

export class DrawingEngine {
  private readonly fill: CanvasRenderingContext2D;
  private readonly paint: CanvasRenderingContext2D;
  private readonly scene: Scene;
  private readonly history = new OpHistory<DrawOp>();
  private readonly snaps: Array<{ index: number; fill: ImageData; paint: ImageData }> = [];
  private draft: Draft | null = null;
  private stickers: Sticker[] = [];
  selectedId: string | null = null;
  private background: BackgroundId = 'white';

  constructor(
    fillCanvas: HTMLCanvasElement,
    paintCanvas: HTMLCanvasElement,
    page: ColoringPage,
    private readonly onHistory: (state: { canUndo: boolean; canRedo: boolean }) => void,
  ) {
    fillCanvas.width = RES;
    fillCanvas.height = RES;
    paintCanvas.width = RES;
    paintCanvas.height = RES;
    const fill = fillCanvas.getContext('2d', { alpha: true });
    const paint = paintCanvas.getContext('2d', { alpha: true });
    if (!fill || !paint) throw new Error('Canvas недоступен');
    this.fill = fill;
    this.paint = paint;
    this.scene = prepareScene(page, RES / 400);
    this.emit();
  }

  get page(): ColoringPage {
    return this.scene.page;
  }

  setBackground(id: BackgroundId): void {
    this.background = id;
  }

  getBackground(): BackgroundId {
    return this.background;
  }

  load(ops: DrawOp[], background: BackgroundId): void {
    this.background = background;
    this.history.load(ops);
    this.snaps.length = 0;
    this.rebuild(true);
  }

  ops(): DrawOp[] {
    return this.history.applied();
  }

  getStickers(): Sticker[] {
    return this.stickers.map((item) => ({ ...item }));
  }

  hitRegion(point: Point): string | null {
    return hitTest(this.scene.page.regions, point.x, point.y)?.id ?? null;
  }

  begin(point: Point, style: StrokeStyle): void {
    if (style.tool === 'bucket') {
      const regionId = this.hitRegion(point);
      if (!regionId) return;
      this.history.push({ kind: 'fill', regionId, color: style.color });
      drawOp(this.fill, this.paint, this.scene, this.history.applied().at(-1)!);
      this.after();
      return;
    }
    if (style.tool === 'pan' || style.tool === 'sticker') return;
    this.draft = { ...style, points: [point] };
    this.drawRange(0, 1);
  }

  move(point: Point): void {
    if (!this.draft) return;
    const last = this.draft.points[this.draft.points.length - 1];
    const extra = sampleSegment(last, point, liveSpacing(this.draft.tool, this.draft.size));
    if (!extra.length) return;
    const start = this.draft.points.length;
    this.draft.points.push(...extra);
    this.drawRange(start, this.draft.points.length);
  }

  end(): boolean {
    if (!this.draft) return false;
    const { points, tool, color, size, alpha, contour, hue, toBackground } = this.draft;
    this.draft = null;
    if (!points.length) return false;
    if (tool === 'eraser') this.history.push({ kind: 'erase', points, size, contour, toBackground });
    else if (tool !== 'bucket' && tool !== 'pan' && tool !== 'sticker') {
      this.history.push({ kind: 'stroke', tool, color, size, alpha, points, contour, hue });
    }
    this.after();
    return true;
  }

  cancel(): void {
    if (!this.draft) return;
    this.draft = null;
    this.rebuild(false);
  }

  addSticker(sticker: Sticker): void {
    this.history.push({ kind: 'sticker-add', sticker: { ...sticker } });
    this.stickers = stickersFrom(this.history.applied());
    this.selectedId = sticker.id;
    this.after();
  }

  updateSticker(id: string, patch: Partial<Pick<Sticker, 'x' | 'y' | 'scale' | 'rotation'>>): void {
    this.history.push({ kind: 'sticker-update', id, patch });
    this.stickers = stickersFrom(this.history.applied());
    this.after();
  }

  deleteSticker(id: string): void {
    this.history.push({ kind: 'sticker-delete', id });
    this.stickers = stickersFrom(this.history.applied());
    if (this.selectedId === id) this.selectedId = null;
    this.after();
  }

  undo(): void {
    this.draft = null;
    this.history.undo();
    this.rebuild(false);
  }

  redo(): void {
    this.draft = null;
    this.history.redo();
    this.rebuild(false);
  }

  async thumbnail(): Promise<Blob> {
    return this.export(360, 'image/jpeg', 0.82);
  }

  async png(): Promise<Blob> {
    return this.export(1600, 'image/png');
  }

  private async export(size: number, type: string, quality?: number): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Не удалось собрать картинку');
    if (size === RES) {
      composite(ctx, size, this.background, this.fill.canvas, this.paint.canvas, this.scene.page, this.stickers);
    } else if (size === 1600) {
      const fill = document.createElement('canvas');
      const paint = document.createElement('canvas');
      fill.width = size;
      fill.height = size;
      paint.width = size;
      paint.height = size;
      const fillCtx = fill.getContext('2d');
      const paintCtx = paint.getContext('2d');
      if (!fillCtx || !paintCtx) throw new Error('Не удалось собрать картинку');
      const scene = prepareScene(this.scene.page, size / 400);
      replay(fillCtx, paintCtx, scene, this.history.applied());
      composite(ctx, size, this.background, fill, paint, this.scene.page, this.stickers);
    } else {
      composite(ctx, size, this.background, this.fill.canvas, this.paint.canvas, this.scene.page, this.stickers);
    }
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
    if (!blob) throw new Error('Не удалось сохранить изображение');
    return blob;
  }

  private drawRange(from: number, to: number): void {
    if (!this.draft) return;
    const tool = this.draft.tool;
    for (let index = from; index < to; index += 1) {
      const point = this.draft.points[index];
      if (tool === 'eraser') {
        paintPoint(this.paint, this.scene, point, index, 'eraser', '#000', this.draft.size, 1, this.draft.contour, 0, true);
        if (this.draft.toBackground) {
          paintPoint(this.fill, this.scene, point, index, 'eraser', '#000', this.draft.size, 1, this.draft.contour, 0, true);
        }
      } else if (tool === 'brush' || tool === 'pencil' || tool === 'marker' || tool === 'watercolor' || tool === 'rainbow' || tool === 'glitter' || tool === 'spray') {
        paintPoint(this.paint, this.scene, point, index, tool, this.draft.color, this.draft.size, this.draft.alpha, this.draft.contour, this.draft.hue, false);
      }
    }
  }

  private rebuild(capture: boolean): void {
    const ops = this.history.applied();
    const snap = [...this.snaps].reverse().find((item) => item.index <= ops.length);
    const start = snap?.index ?? 0;
    if (snap) {
      this.fill.putImageData(snap.fill, 0, 0);
      this.paint.putImageData(snap.paint, 0, 0);
      for (const op of ops.slice(start)) drawOp(this.fill, this.paint, this.scene, op);
    } else {
      replay(this.fill, this.paint, this.scene, ops);
    }
    this.stickers = stickersFrom(ops);
    if (capture) this.captureSnaps(ops.length);
    this.emit();
  }

  private captureSnaps(total: number): void {
    this.snaps.length = 0;
    if (total < 24) return;
    replay(this.fill, this.paint, this.scene, this.history.applied());
    this.snaps.push({
      index: total,
      fill: this.fill.getImageData(0, 0, RES, RES),
      paint: this.paint.getImageData(0, 0, RES, RES),
    });
  }

  private after(): void {
    if (this.history.cursor > 0 && this.history.cursor % 24 === 0) {
      this.snaps.push({
        index: this.history.cursor,
        fill: this.fill.getImageData(0, 0, RES, RES),
        paint: this.paint.getImageData(0, 0, RES, RES),
      });
      this.snaps.splice(0, Math.max(0, this.snaps.length - 4));
    }
    this.snaps.splice(0, this.snaps.length && this.snaps.some((item) => item.index > this.history.cursor) ? 0 : 0);
    for (let i = this.snaps.length - 1; i >= 0; i -= 1) {
      if (this.snaps[i].index > this.history.cursor) this.snaps.splice(i, 1);
    }
    this.emit();
  }

  private emit(): void {
    this.onHistory({ canUndo: this.history.canUndo, canRedo: this.history.canRedo });
  }
}
