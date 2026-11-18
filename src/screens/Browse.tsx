import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Download, Heart, Trash2 } from 'lucide-react';
import { categoryOrder, collections, getCollection } from '@/catalog/collections';
import { difficultyLabel, normalizeSearch, picturesLabel } from '@/catalog/labels';
import { pageMetas } from '@/catalog/manifest';
import { ColoringPreview, Modal, useBlobUrl } from '@/components/ui';
import { renderPng } from '@/editor/render';
import { loadPage } from '@/catalog/loadPage';
import { drawingDb } from '@/storage/db';
import type { DrawingMeta } from '@/storage/types';
import { useNav } from '@/store/nav';
import { useSettings } from '@/store/settings';
import { playTap } from '@/audio/sounds';

const Back = ({ label = 'Назад' }: { label?: string }) => {
  const go = useNav((state) => state.go);
  return (
    <button type="button" className="icon-btn" aria-label={label} onClick={() => go({ name: 'home' })}>
      <ChevronLeft />
    </button>
  );
};

export const Collections = () => {
  const go = useNav((state) => state.go);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<string>('all');
  const [soon, setSoon] = useState<string | null>(null);
  const needle = normalizeSearch(query);
  const visible = collections.filter((item) => {
    const groupOk = group === 'all' || item.group === group;
    const text = normalizeSearch(`${item.title} ${item.description}`);
    return groupOk && (!needle || text.includes(needle));
  });

  return (
    <main className="screen">
      <header className="topbar glass">
        <Back />
        <b>Коллекции</b>
      </header>
      <input className="search" style={{ marginTop: 12 }} value={query} placeholder="Найти коллекцию" aria-label="Поиск" onChange={(event) => setQuery(event.target.value)} />
      <div className="chip-row">
        <button type="button" className={group === 'all' ? 'chip active' : 'chip'} onClick={() => setGroup('all')}>Все</button>
        {categoryOrder.map((item) => (
          <button key={item.id} type="button" className={group === item.id ? 'chip active' : 'chip'} onClick={() => setGroup(item.id)}>
            {item.title}
          </button>
        ))}
      </div>
      {categoryOrder.map((category) => {
        const items = visible.filter((item) => item.group === category.id);
        if (!items.length) return null;
        return (
          <section key={category.id}>
            <div className="section-title"><h2>{category.title}</h2></div>
            <div className="card-grid">
              {items.map((collection) => {
                const count = pageMetas.filter((page) => page.collectionId === collection.id).length;
                const first = pageMetas.find((page) => page.collectionId === collection.id);
                return (
                  <button
                    key={collection.id}
                    type="button"
                    className="card"
                    onClick={() => {
                      playTap();
                      if (collection.status === 'soon') setSoon(collection.title);
                      else go({ name: 'collection', id: collection.id });
                    }}
                  >
                    <div className="cover" style={{ background: collection.tint }}>
                      {collection.status === 'soon' ? <span className="badge">Скоро</span> : null}
                      {first ? <ColoringPreview pageId={first.id} /> : <span className="badge">Нужна лицензия</span>}
                    </div>
                    <figcaption>
                      <strong>{collection.title}</strong>
                      <span className="muted">{collection.status === 'soon' ? 'Ждём разрешение' : picturesLabel(count)}</span>
                    </figcaption>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
      {soon ? (
        <Modal title="Скоро">
          <p className="note">Коллекция «{soon}» появится только с лицензированными картинками. Сейчас можно рисовать оригинальных героев ColorJoy.</p>
          <button type="button" className="primary" onClick={() => setSoon(null)}>Понятно</button>
        </Modal>
      ) : null}
    </main>
  );
};

export const CollectionGallery = ({ id }: { id: string }) => {
  const go = useNav((state) => state.go);
  const favoritePages = useSettings((state) => state.favoritePages);
  const togglePage = useSettings((state) => state.togglePage);
  const collection = getCollection(id);
  const pages = pageMetas.filter((page) => page.collectionId === id);
  if (!collection || collection.status === 'soon') {
    return (
      <main className="screen">
        <header className="topbar glass"><Back /></header>
        <p className="note">Этой коллекции ещё нет.</p>
      </main>
    );
  }
  return (
    <main className="screen">
      <header className="topbar glass">
        <button type="button" className="icon-btn" aria-label="К коллекциям" onClick={() => go({ name: 'collections' })}>
          <ChevronLeft />
        </button>
        <b>{collection.title}</b>
      </header>
      <p className="note" style={{ margin: '12px 0' }}>{collection.description}</p>
      <div className="card-grid">
        {pages.map((page) => (
          <article key={page.id} className="card">
            <button type="button" className="card" onClick={() => go({ name: 'editor', pageId: page.id })}>
              <div className="cover" style={{ background: collection.tint }}>
                <ColoringPreview pageId={page.id} />
                <span className="badge">{difficultyLabel[page.difficulty]}</span>
              </div>
            </button>
            <figcaption>
              <strong>{page.title}</strong>
              <button type="button" className="ghost" aria-pressed={favoritePages.includes(page.id)} onClick={() => togglePage(page.id)}>
                <Heart size={16} fill={favoritePages.includes(page.id) ? '#ff6b93' : 'none'} /> В избранное
              </button>
            </figcaption>
          </article>
        ))}
      </div>
    </main>
  );
};

export const Favorites = () => {
  const go = useNav((state) => state.go);
  const favoritePages = useSettings((state) => state.favoritePages);
  const pages = pageMetas.filter((page) => favoritePages.includes(page.id));
  return (
    <main className="screen">
      <header className="topbar glass">
        <Back />
        <b>Избранное</b>
      </header>
      {pages.length === 0 ? <section className="empty glass"><p className="note">Нажми сердечко на картинке, и она появится здесь.</p></section> : null}
      <div className="card-grid" style={{ marginTop: 12 }}>
        {pages.map((page) => (
          <button key={page.id} type="button" className="card" onClick={() => go({ name: 'editor', pageId: page.id })}>
            <div className="cover" style={{ background: '#fff' }}>
              <ColoringPreview pageId={page.id} />
            </div>
            <figcaption><strong>{page.title}</strong></figcaption>
          </button>
        ))}
      </div>
    </main>
  );
};

const DrawingCard = ({ item, onChange }: { item: DrawingMeta; onChange: () => void }) => {
  const go = useNav((state) => state.go);
  const url = useBlobUrl(item.thumb);
  const [rename, setRename] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [remove, setRemove] = useState(false);
  const download = async () => {
    const page = await loadPage(item.pageId === 'free-draw' ? 'free-draw' : item.pageId);
    const payload = await drawingDb.payload(item.id);
    if (!payload) return;
    const blob = await renderPng(page, payload.ops, payload.background);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${item.title}.png`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1500);
  };
  return (
    <article className="work-card">
      {url ? <img className="thumb" src={url} alt="" /> : <div className="thumb" />}
      <div>
        <strong>{item.title}</strong>
        <span className="muted">{new Date(item.updatedAt).toLocaleDateString('ru')} · {item.completed ? 'Готово' : 'В процессе'}</span>
        <div className="row">
          <button type="button" className="ghost" onClick={() => go(item.pageId === 'free-draw' ? { name: 'free', drawingId: item.id } : { name: 'editor', pageId: item.pageId, drawingId: item.id })}>Продолжить</button>
          <button type="button" className="icon-btn" aria-label="Скачать" onClick={() => void download()}><Download size={18} /></button>
          <button type="button" className="icon-btn" aria-label={item.favorite ? 'Убрать из избранного' : 'В избранное'} onClick={() => void drawingDb.patchMeta(item.id, { favorite: !item.favorite }).then(onChange)}>
            <Heart size={18} fill={item.favorite ? '#ff6b93' : 'none'} />
          </button>
          <button type="button" className="ghost" onClick={() => setRename(true)}>Имя</button>
          <button type="button" className="icon-btn" aria-label="Удалить" onClick={() => setRemove(true)}><Trash2 size={18} /></button>
        </div>
      </div>
      {rename ? (
        <Modal title="Новое имя">
          <input className="field" value={title} aria-label="Название" onChange={(event) => setTitle(event.target.value)} />
          <button type="button" className="primary" onClick={() => void drawingDb.patchMeta(item.id, { title: title.trim() || item.title }).then(() => { setRename(false); onChange(); })}>Сохранить</button>
        </Modal>
      ) : null}
      {remove ? (
        <Modal title="Удалить рисунок?">
          <p className="note">Рисунок пропадёт с этого устройства.</p>
          <div className="row">
            <button type="button" className="danger" onClick={() => void drawingDb.remove(item.id).then(onChange)}>Удалить</button>
            <button type="button" className="ghost" onClick={() => setRemove(false)}>Оставить</button>
          </div>
        </Modal>
      ) : null}
    </article>
  );
};

export const Gallery = () => {
  const [items, setItems] = useState<DrawingMeta[]>([]);
  const refresh = () => void drawingDb.list().then(setItems);
  useEffect(() => { refresh(); }, []);
  const sorted = useMemo(() => items, [items]);
  return (
    <main className="screen">
      <header className="topbar glass">
        <Back />
        <b>Мои рисунки</b>
      </header>
      {sorted.length === 0 ? (
        <section className="empty glass" style={{ marginTop: 16 }}>
          <strong>Здесь появятся твои работы</strong>
          <p className="note">Открой раскраску и проведи пальцем или мышкой — рисунок сохранится сам.</p>
        </section>
      ) : (
        <div className="gallery-grid" style={{ marginTop: 12 }}>
          {sorted.map((item) => <DrawingCard key={item.id} item={item} onChange={refresh} />)}
        </div>
      )}
    </main>
  );
};
