import { useEffect, useState, type ReactNode } from 'react';
import { openPath } from '@/catalog/geometry';
import { loadPage, peekPage } from '@/catalog/loadPage';
import type { ColoringPage, Region } from '@/catalog/types';

const boxesOverlap = (a: Region, b: Region) =>
  !(a.bbox.maxX < b.bbox.minX || a.bbox.minX > b.bbox.maxX || a.bbox.maxY < b.bbox.minY || a.bbox.minY > b.bbox.maxY);

const clipPath = (region: Region, regions: Region[]) =>
  [region.d, ...regions.filter((other) => other.id !== region.id && other.area < region.area && boxesOverlap(region, other)).map((other) => other.d)].join(' ');

export const PageSvg = ({ page, debug = false }: { page: ColoringPage; debug?: boolean }) => (
  <svg viewBox="0 0 400 400" className="lines layer" aria-hidden="true">
    {debug
      ? page.regions.map((region, index) => (
          <path key={`d-${region.id}`} d={region.d} fill={`hsl(${(index * 47) % 360} 72% 74%)`} opacity={0.55} />
        ))
      : null}
    {page.strokeWidth > 0
      ? page.regions.map((region) => region.id === 'sky' ? null : (
          <g key={region.id}>
            <clipPath id={`${page.id}-${region.id}`} clipPathUnits="userSpaceOnUse">
              <path d={clipPath(region, page.regions)} clipRule="evenodd" />
            </clipPath>
            <path
              d={region.d}
              fill="none"
              stroke="#1b1724"
              strokeWidth={page.strokeWidth * 2}
              strokeLinejoin="round"
              strokeLinecap="round"
              clipPath={`url(#${page.id}-${region.id})`}
            />
          </g>
        ))
      : null}
    {page.decors.map((decor, index) => (
      <path
        key={`decor-${index}`}
        d={openPath(decor.points)}
        fill="none"
        stroke="#1b1724"
        strokeWidth={Math.min(decor.width ?? page.strokeWidth * 0.65, page.strokeWidth)}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ))}
  </svg>
);

export const ColoringPreview = ({ pageId }: { pageId: string }) => {
  const [page, setPage] = useState<ColoringPage | null>(() => peekPage(pageId) ?? null);
  useEffect(() => {
    let live = true;
    const known = peekPage(pageId);
    if (known) setPage(known);
    else {
      setPage(null);
      void loadPage(pageId).then((item) => {
        if (live) setPage(item);
      });
    }
    return () => {
      live = false;
    };
  }, [pageId]);
  if (!page) return <div className="preview-skeleton" />;
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true">
      {page.regions.map((region) => region.id === 'sky' ? null : (
        <path key={region.id} d={region.d} fill="none" stroke="#1b1724" strokeWidth={page.strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
      ))}
    </svg>
  );
};

export const Modal = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="modal-back" role="dialog" aria-modal="true" aria-label={title}>
    <div className="modal glass">
      <h2>{title}</h2>
      {children}
    </div>
  </div>
);

export const useBlobUrl = (blob: Blob | null): string | null => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);
  return url;
};
