import { create } from 'zustand';

export type Route =
  | { name: 'home' }
  | { name: 'collections' }
  | { name: 'collection'; id: string }
  | { name: 'gallery' }
  | { name: 'favorites' }
  | { name: 'parent' }
  | { name: 'editor'; pageId: string; drawingId?: string }
  | { name: 'free'; drawingId?: string };

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

const withBase = (path: string): string => (base ? `${base}${path === '/' ? '/' : path}` : path);

export const toPath = (route: Route): string => {
  if (route.name === 'home') return withBase('/');
  if (route.name === 'collections') return withBase('/collections');
  if (route.name === 'collection') return withBase(`/collections/${route.id}`);
  if (route.name === 'gallery') return withBase('/gallery');
  if (route.name === 'favorites') return withBase('/favorites');
  if (route.name === 'parent') return withBase('/parent');
  if (route.name === 'free') return withBase(route.drawingId ? `/draw/${route.drawingId}` : '/draw');
  return withBase(route.drawingId ? `/editor/${route.pageId}/${route.drawingId}` : `/editor/${route.pageId}`);
};

export const parsePath = (pathname: string): Route => {
  const stripped = base && (pathname === base || pathname.startsWith(`${base}/`)) ? pathname.slice(base.length) || '/' : pathname;
  const parts = stripped.split('/').filter(Boolean);
  if (parts[0] === 'collections' && parts[1]) return { name: 'collection', id: decodeURIComponent(parts[1]) };
  if (parts[0] === 'collections') return { name: 'collections' };
  if (parts[0] === 'gallery') return { name: 'gallery' };
  if (parts[0] === 'favorites') return { name: 'favorites' };
  if (parts[0] === 'parent') return { name: 'parent' };
  if (parts[0] === 'draw') return { name: 'free', drawingId: parts[1] };
  if (parts[0] === 'editor' && parts[1]) return { name: 'editor', pageId: decodeURIComponent(parts[1]), drawingId: parts[2] };
  return { name: 'home' };
};

export const useNav = create<{ route: Route; go: (route: Route, replace?: boolean) => void }>((set) => ({
  route: parsePath(window.location.pathname),
  go: (route, replace = false) => {
    const path = toPath(route);
    if (replace) window.history.replaceState({}, '', path);
    else window.history.pushState({}, '', path);
    set({ route: parsePath(path) });
  },
}));

window.addEventListener('popstate', () => {
  useNav.setState({ route: parsePath(window.location.pathname) });
});
