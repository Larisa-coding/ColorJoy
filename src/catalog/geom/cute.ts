import { buildGeometry } from '../build';
import { pagesByGroup } from '../manifest';
import type { PageGeometry } from '../types';

export const geometry: Record<string, PageGeometry> = Object.fromEntries(
  pagesByGroup('cute').map((meta) => [meta.id, buildGeometry(meta)]),
);
