import { useEffect, useState } from 'react';
import { Images, Lock, Palette, Settings, Shuffle, Sparkles, Star, Volume2, VolumeX } from 'lucide-react';
import { appConfig } from '@/config';
import { collections, popularCollectionIds } from '@/catalog/collections';
import { ColoringPreview } from '@/components/ui';
import { useBlobUrl } from '@/components/ui';
import { picturesLabel } from '@/catalog/labels';
import { pageMetas } from '@/catalog/manifest';
import { drawingDb } from '@/storage/db';
import type { DrawingMeta } from '@/storage/types';
import { useNav } from '@/store/nav';
import { useSettings } from '@/store/settings';
import { playTap } from '@/audio/sounds';

const Work = ({ item, onOpen }: { item: DrawingMeta; onOpen: () => void }) => {
  const url = useBlobUrl(item.thumb);
  return (
    <button type="button" className="work-card" onClick={onOpen} style={{ minWidth: 160 }}>
      {url ? <img className="thumb" src={url} alt="" /> : <div className="thumb" />}
      <div>
        <strong>{item.title}</strong>
        <span className="muted">{item.completed ? 'Готово' : 'Продолжить'}</span>
      </div>
    </button>
  );
};

export const Home = () => {
  const go = useNav((state) => state.go);
  const sound = useSettings((state) => state.sound);
  const set = useSettings((state) => state.set);
  const [items, setItems] = useState<DrawingMeta[]>([]);

  useEffect(() => {
    void drawingDb.list().then(setItems);
  }, []);

  const unfinished = items.filter((item) => !item.completed).slice(0, 8);
  const popular = popularCollectionIds
    .map((id) => collections.find((item) => item.id === id))
    .filter((item) => item !== undefined);

  return (
    <main className="screen">
      <header className="topbar glass">
        <div className="brand">
          <div className="logo-mark" aria-hidden="true">
            <Palette size={22} />
          </div>
          <b>{appConfig.name}</b>
        </div>
        <button type="button" className="icon-btn" aria-label="Мои рисунки" onClick={() => go({ name: 'gallery' })}>
          <Images size={22} />
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label={sound ? 'Выключить звук' : 'Включить звук'}
          aria-pressed={!sound}
          onClick={() => set({ sound: !sound })}
        >
          {sound ? <Volume2 size={22} /> : <VolumeX size={22} />}
        </button>
        <button type="button" className="icon-btn" aria-label="Родительский раздел" onClick={() => go({ name: 'parent' })}>
          <Lock size={20} />
        </button>
      </header>
      <section className="hero">
        <h1>{appConfig.greeting}</h1>
        <p>{appConfig.tagline}</p>
      </section>
      {unfinished.length ? (
        <section>
          <div className="section-title">
            <h2>Продолжить</h2>
          </div>
          <div className="scroller">
            {unfinished.map((item) => (
              <Work
                key={item.id}
                item={item}
                onOpen={() => go({ name: 'editor', pageId: item.pageId, drawingId: item.id })}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="welcome glass">
          <strong>Добро пожаловать в студию</strong>
          <p className="note">Выбери коллекцию, открой картинку и раскрашивай кистью прямо внутри линий.</p>
        </section>
      )}
      <section className="grid-actions">
        <button type="button" className="action-card" onClick={() => { playTap(); go({ name: 'collections' }); }}>
          <Sparkles />
          <strong>Все коллекции</strong>
          <span>{pageMetas.length} раскрасок</span>
        </button>
        <button type="button" className="action-card" onClick={() => go({ name: 'gallery' })}>
          <Images />
          <strong>Мои рисунки</strong>
          <span>{items.length ? `${items.length} работ` : 'Пока пусто'}</span>
        </button>
        <button
          type="button"
          className="action-card"
          onClick={() => {
            const page = pageMetas[Math.floor(Math.random() * pageMetas.length)];
            go({ name: 'editor', pageId: page.id });
          }}
        >
          <Shuffle />
          <strong>Случайная раскраска</strong>
          <span>Открыть сюрприз</span>
        </button>
        <button type="button" className="action-card" onClick={() => go({ name: 'favorites' })}>
          <Star />
          <strong>Избранное</strong>
          <span>Любимые картинки</span>
        </button>
        <button type="button" className="action-card" onClick={() => go({ name: 'free' })}>
          <Palette />
          <strong>Нарисовать самому</strong>
          <span>Чистый лист</span>
        </button>
        <button type="button" className="action-card" onClick={() => go({ name: 'parent' })}>
          <Settings />
          <strong>Для взрослых</strong>
          <span>Настройки и установка</span>
        </button>
      </section>
      <div className="section-title">
        <h2>Популярное</h2>
      </div>
      <section className="card-grid">
        {popular.map((collection) => {
          const first = pageMetas.find((page) => page.collectionId === collection.id);
          const count = pageMetas.filter((page) => page.collectionId === collection.id).length;
          return (
            <button key={collection.id} type="button" className="card" onClick={() => go({ name: 'collection', id: collection.id })}>
              <div className="cover" style={{ background: collection.tint }}>
                {first ? <ColoringPreview pageId={first.id} /> : null}
              </div>
              <figcaption>
                <strong>{collection.title}</strong>
                <span className="muted">{picturesLabel(count)}</span>
              </figcaption>
            </button>
          );
        })}
      </section>
    </main>
  );
};
