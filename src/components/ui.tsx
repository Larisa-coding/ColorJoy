import { useEffect, useState, type ReactNode } from 'react';
import { openPath } from '@/catalog/geometry';
import { loadPage, peekPage } from '@/catalog/loadPage';
import type { ColoringPage } from '@/catalog/types';

export const PageSvg = ({ page, debug = false }: { page: ColoringPage; debug?: boolean }) => (
  <svg viewBox="0 0 400 400" className="lines layer" aria-hidden="true">
    {debug
      ? page.regions.map((region, index) => (
          <path key={`d-${region.id}`} d={region.d} fill={`hsl(${(index * 47) % 360} 72% 74%)`} opacity={0.55} />
        ))
      : null}
    {page.strokeWidth > 0
      ? page.regions.map((region) => (
          <path
            key={region.id}
            d={region.d}
            fill="none"
            stroke="#1b1724"
            strokeWidth={page.strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))
      : null}
    {page.decors.map((decor, index) => (
      <path
        key={`decor-${index}`}
        d={openPath(decor.points)}
        fill="none"
        stroke="#1b1724"
        strokeWidth={decor.width ?? Math.max(3, page.strokeWidth * 0.45)}
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
      {page.regions.map((region) => (
        <path key={region.id} d={region.d} fill="none" stroke="#1b1724" strokeWidth={page.strokeWidth} strokeLinejoin="round" />
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
