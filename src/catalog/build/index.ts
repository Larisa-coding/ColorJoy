import type { PageGeometry, PageMeta } from '../types';
import { drawPage } from './pages';

export const buildGeometry = (meta: PageMeta): PageGeometry => drawPage(meta);
