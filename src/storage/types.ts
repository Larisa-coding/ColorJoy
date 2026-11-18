import type { DrawOp, BackgroundId, ToolName } from '@/editor/model';

export type DrawingMeta = {
  schemaVersion: 1;
  id: string;
  pageId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  completed: boolean;
  favorite: boolean;
  thumb: Blob | null;
};

export type DrawingPayload = {
  schemaVersion: 1;
  id: string;
  ops: DrawOp[];
  background: BackgroundId;
  contour: boolean;
  view: { zoom: number; panX: number; panY: number; base: number };
  tool: { name: ToolName; color: string; size: number; alpha: number; toBackground: boolean };
};

export const isMeta = (value: unknown): value is DrawingMeta => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<DrawingMeta>;
  return item.schemaVersion === 1 && typeof item.id === 'string' && typeof item.pageId === 'string' && typeof item.title === 'string';
};

export const isPayload = (value: unknown): value is DrawingPayload => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<DrawingPayload>;
  return item.schemaVersion === 1 && typeof item.id === 'string' && Array.isArray(item.ops);
};
