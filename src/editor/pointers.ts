import type { DrawingEngine, StrokeStyle } from './engine';
import type { Viewport } from './viewport';
import type { Point } from './sample';

type Handlers = {
  getStyle: () => StrokeStyle;
  onSticker: (point: Point) => void;
  onAction: (kind: 'stroke' | 'fill' | 'erase') => void;
};

export const bindPointers = (el: HTMLElement, viewport: Viewport, engine: DrawingEngine, handlers: Handlers) => {
  const points = new Map<number, { x: number; y: number }>();
  let suppress = false;

  const down = (event: PointerEvent) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    event.preventDefault();
    try {
      el.setPointerCapture(event.pointerId);
    } catch {
      /* Синтетическое событие или браузер без активного указателя. */
    }
    points.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (points.size >= 2) {
      engine.end();
      const [a, b] = [...points.values()];
      viewport.beginPinch(a, b);
      suppress = true;
      return;
    }
    if (suppress) return;
    const style = handlers.getStyle();
    const art = viewport.toArt(event.clientX, event.clientY);
    if (style.tool === 'pan') viewport.beginPan(event.clientX, event.clientY);
    else if (style.tool === 'sticker') handlers.onSticker(art);
    else {
      engine.begin(art, style);
      if (style.tool === 'bucket') handlers.onAction('fill');
    }
  };

  const move = (event: PointerEvent) => {
    if (!points.has(event.pointerId)) return;
    points.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (points.size >= 2) {
      const [a, b] = [...points.values()];
      viewport.pinchTo(a, b);
      return;
    }
    if (suppress) return;
    const style = handlers.getStyle();
    if (style.tool === 'pan') viewport.movePan(event.clientX, event.clientY);
    else engine.move(viewport.toArt(event.clientX, event.clientY));
  };

  const up = (event: PointerEvent) => {
    points.delete(event.pointerId);
    if (points.size >= 2) return;
    if (points.size === 1) {
      viewport.endPinch();
      suppress = true;
      return;
    }
    viewport.endPinch();
    viewport.endPan();
    const style = handlers.getStyle();
    const drew = engine.end();
    if (drew) handlers.onAction(style.tool === 'eraser' ? 'erase' : 'stroke');
    suppress = false;
  };

  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  const blockMenu = (event: Event) => event.preventDefault();
  el.addEventListener('contextmenu', blockMenu);
  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', up);
    el.removeEventListener('contextmenu', blockMenu);
  };
};
