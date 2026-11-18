import { useEffect, useState } from 'react';
import { appConfig } from '@/config';
import { unlockAudio, syncMusic } from '@/audio/sounds';
import { initPwa } from '@/pwa';
import { Collections, CollectionGallery, Favorites, Gallery } from '@/screens/Browse';
import { Editor } from '@/screens/Editor';
import { Home } from '@/screens/Home';
import { Parent } from '@/screens/Parent';
import { useNav } from '@/store/nav';
import { usePraise } from '@/store/praise';
import { useSettings } from '@/store/settings';

export const App = () => {
  const route = useNav((state) => state.route);
  const praise = usePraise((state) => state.text);
  const motion = useSettings((state) => state.motion);
  const [update, setUpdate] = useState<null | (() => void)>(null);

  useEffect(() => {
    document.title = appConfig.name;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      const reduced = motion === 'reduced' || (motion === 'system' && reduce.matches);
      document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
    };
    apply();
    reduce.addEventListener('change', apply);
    const unlock = () => {
      unlockAudio();
      syncMusic();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    initPwa((applyUpdate) => setUpdate(() => applyUpdate));
    const { resume } = useSettings.getState();
    if (window.location.pathname === '/' && resume) {
      useNav.getState().go({ name: 'editor', pageId: resume.pageId, drawingId: resume.drawingId }, true);
    }
    return () => reduce.removeEventListener('change', apply);
  }, [motion]);

  return (
    <div className="app">
      {route.name === 'home' ? <Home /> : null}
      {route.name === 'collections' ? <Collections /> : null}
      {route.name === 'collection' ? <CollectionGallery id={route.id} /> : null}
      {route.name === 'gallery' ? <Gallery /> : null}
      {route.name === 'favorites' ? <Favorites /> : null}
      {route.name === 'parent' ? <Parent /> : null}
      {route.name === 'editor' ? <Editor pageId={route.pageId} drawingId={route.drawingId} /> : null}
      {route.name === 'free' ? <Editor pageId="free-draw" drawingId={route.drawingId} /> : null}
      {praise ? <div className="praise glass">{praise}</div> : null}
      {update ? (
        <div className="praise glass" style={{ pointerEvents: 'auto', top: 'auto', bottom: 16 }}>
          <button type="button" className="ghost" onClick={update}>Обновить приложение</button>
        </div>
      ) : null}
    </div>
  );
};
