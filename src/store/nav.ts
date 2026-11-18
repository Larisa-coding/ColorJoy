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

export const toPath = (route: Route): string => {
  if (route.name === 'home') return '/';
  if (route.name === 'collections') return '/collections';
  if (route.name === 'collection') return `/collections/${route.id}`;
  if (route.name === 'gallery') return '/gallery';
  if (route.name === 'favorites') return '/favorites';
  if (route.name === 'parent') return '/parent';
  if (route.name === 'free') return route.drawingId ? `/draw/${route.drawingId}` : '/draw';
  return route.drawingId ? `/editor/${route.pageId}/${route.drawingId}` : `/editor/${route.pageId}`;
};

export const parsePath = (pathname: string): Route => {
  const parts = pathname.split('/').filter(Boolean);
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
