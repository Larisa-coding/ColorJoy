import { ART } from '@/catalog/types';

export type ViewState = { zoom: number; panX: number; panY: number; base: number };

export const artFromScreen = (
  clientX: number,
  clientY: number,
  frameLeft: number,
  frameTop: number,
  panX: number,
  panY: number,
  zoom: number,
  base: number,
): { x: number; y: number } => ({
  x: ((clientX - frameLeft - panX) / zoom / base) * ART,
  y: ((clientY - frameTop - panY) / zoom / base) * ART,
});

export class Viewport {
  zoom = 1;
  panX = 0;
  panY = 0;
  base = 320;
  private frame: HTMLElement;
  private world: HTMLElement;
  private pinch: { dist: number; zoom: number } | null = null;
  private pan: { x: number; y: number; panX: number; panY: number } | null = null;

  constructor(frame: HTMLElement, world: HTMLElement) {
    this.frame = frame;
    this.world = world;
    this.fit();
    this.frame.addEventListener('wheel', this.onWheel, { passive: false });
  }

  destroy(): void {
    this.frame.removeEventListener('wheel', this.onWheel);
  }

  snapshot(): ViewState {
    return { zoom: this.zoom, panX: this.panX, panY: this.panY, base: this.base };
  }

  restore(view: ViewState): void {
    this.zoom = view.zoom;
    this.base = view.base || this.base;
    this.panX = view.panX;
    this.panY = view.panY;
    this.apply();
  }

  fit(): void {
    const rect = this.frame.getBoundingClientRect();
    this.base = Math.max(180, Math.min(rect.width, rect.height) - 12);
    this.zoom = 1;
    this.panX = (rect.width - this.base) / 2;
    this.panY = (rect.height - this.base) / 2;
    this.apply();
  }

  zoomBy(factor: number): void {
    const rect = this.frame.getBoundingClientRect();
    this.zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, this.zoom * factor);
  }

  resize(): void {
    const rect = this.frame.getBoundingClientRect();
    if (rect.width < 20 || rect.height < 20) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const art = this.toArt(cx, cy);
    const inside = art.x >= 0 && art.y >= 0 && art.x <= ART && art.y <= ART;
    if (!inside) {
      const zoom = this.zoom;
      this.fit();
      if (zoom > 1.05) this.zoomBy(zoom);
      return;
    }
    this.base = Math.max(180, Math.min(rect.width, rect.height) - 12);
    const worldX = (art.x / ART) * this.base;
    const worldY = (art.y / ART) * this.base;
    this.panX = rect.width / 2 - worldX * this.zoom;
    this.panY = rect.height / 2 - worldY * this.zoom;
    this.apply();
  }

  toArt(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.frame.getBoundingClientRect();
    return artFromScreen(clientX, clientY, rect.left, rect.top, this.panX, this.panY, this.zoom, this.base);
  }

  zoomAt(clientX: number, clientY: number, next: number): void {
    const rect = this.frame.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const worldX = (x - this.panX) / this.zoom;
    const worldY = (y - this.panY) / this.zoom;
    this.zoom = Math.min(6, Math.max(0.6, next));
    this.panX = x - worldX * this.zoom;
    this.panY = y - worldY * this.zoom;
    this.apply();
  }

  beginPinch(a: { x: number; y: number }, b: { x: number; y: number }): void {
    this.pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom: this.zoom };
    this.pan = null;
  }

  pinchTo(a: { x: number; y: number }, b: { x: number; y: number }): void {
    if (!this.pinch) return;
    const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    this.zoomAt(midX, midY, this.pinch.zoom * (dist / this.pinch.dist));
  }

  endPinch(): void {
    this.pinch = null;
  }

  beginPan(clientX: number, clientY: number): void {
    this.pan = { x: clientX, y: clientY, panX: this.panX, panY: this.panY };
  }

  movePan(clientX: number, clientY: number): void {
    if (!this.pan) return;
    this.panX = this.pan.panX + (clientX - this.pan.x);
    this.panY = this.pan.panY + (clientY - this.pan.y);
    this.apply();
  }

  endPan(): void {
    this.pan = null;
  }

  private apply(): void {
    this.world.style.width = `${this.base}px`;
    this.world.style.height = `${this.base}px`;
    this.world.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
  }

  private onWheel = (event: WheelEvent) => {
    event.preventDefault();
    const factor = event.deltaY > 0 ? 0.92 : 1.08;
    this.zoomAt(event.clientX, event.clientY, this.zoom * factor);
  };
}
