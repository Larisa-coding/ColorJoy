import { useEffect, useRef, useState } from 'react';
import {
  Brush, ChevronLeft, Droplets, Eraser, Hand, Highlighter, Minus, PaintBucket, Pencil,
  Plus, Redo2, Save, Sparkles, SprayCan, Sticker, Undo2, ZoomIn,
} from 'lucide-react';
import { colorGroups, hslToHex, palette } from '@/catalog/colors';
import { freePage } from '@/catalog/freePage';
import { loadPage } from '@/catalog/loadPage';
import type { ColoringPage } from '@/catalog/types';
import { Modal, PageSvg } from '@/components/ui';
import { playColor, playDone, playFill, playSave, playTool } from '@/audio/sounds';
import { DrawingEngine, type StrokeStyle } from '@/editor/engine';
import { backgroundCss, backgrounds, type BackgroundId, type StickerKind, type ToolName } from '@/editor/model';
import { bindPointers } from '@/editor/pointers';
import { Viewport } from '@/editor/viewport';
import { drawingDb, storageErrorText } from '@/storage/db';
import type { DrawingPayload } from '@/storage/types';
import { useNav } from '@/store/nav';
import { praiseEvery, useSettings } from '@/store/settings';
import { usePraise } from '@/store/praise';

const tools: Array<{ id: ToolName; label: string; icon: typeof Brush }> = [
  { id: 'brush', label: 'Кисть', icon: Brush },
  { id: 'pencil', label: 'Карандаш', icon: Pencil },
  { id: 'marker', label: 'Фломастер', icon: Highlighter },
  { id: 'watercolor', label: 'Акварель', icon: Droplets },
  { id: 'bucket', label: 'Ведёрко', icon: PaintBucket },
  { id: 'eraser', label: 'Ластик', icon: Eraser },
];

const extraTools: Array<{ id: ToolName; label: string; icon: typeof Brush }> = [
  { id: 'rainbow', label: 'Радуга', icon: Sparkles },
  { id: 'glitter', label: 'Блёстки', icon: Sparkles },
  { id: 'spray', label: 'Спрей', icon: SprayCan },
  { id: 'sticker', label: 'Наклейка', icon: Sticker },
  { id: 'pan', label: 'Двигать', icon: Hand },
];

const stickers: StickerKind[] = ['star', 'heart', 'cloud', 'flower', 'butterfly', 'smile'];
const sizes: Record<string, { size: number; alpha: number }> = {
  brush: { size: 14, alpha: 0.86 },
  pencil: { size: 4.5, alpha: 0.9 },
  marker: { size: 12, alpha: 0.96 },
  watercolor: { size: 26, alpha: 0.22 },
  eraser: { size: 18, alpha: 1 },
  rainbow: { size: 12, alpha: 0.9 },
  glitter: { size: 18, alpha: 1 },
  spray: { size: 20, alpha: 0.75 },
  bucket: { size: 12, alpha: 1 },
  sticker: { size: 12, alpha: 1 },
  pan: { size: 12, alpha: 1 },
};

type Session = { page: ColoringPage; drawingId: string; payload: DrawingPayload | null; title: string };

export const Editor = ({ pageId, drawingId }: { pageId: string; drawingId?: string }) => {
  const go = useNav((state) => state.go);
  const settings = useSettings();
  const showPraise = usePraise((state) => state.show);
  const [session, setSession] = useState<Session | null>(null);
  const [tool, setTool] = useState<ToolName>('brush');
  const [color, setColor] = useState('#ff5d8f');
  const [size, setSize] = useState(14);
  const [alpha, setAlpha] = useState(0.86);
  const [contour, setContour] = useState(settings.contour);
  const [toBackground, setToBackground] = useState(false);
  const [background, setBackground] = useState<BackgroundId>('white');
  const [group, setGroup] = useState('basic');
  const [hue, setHue] = useState(330);
  const [sat, setSat] = useState(80);
  const [light, setLight] = useState(62);
  const [sticker, setSticker] = useState<StickerKind>('star');
  const [stickersOnCanvas, setStickersOnCanvas] = useState<ReturnType<DrawingEngine['getStickers']>>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });
  const [status, setStatus] = useState('Сохранено');
  const [leave, setLeave] = useState(false);
  const [done, setDone] = useState(false);
  const [more, setMore] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetDrag = useRef(0);
  const [picker, setPicker] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLCanvasElement>(null);
  const paintRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<DrawingEngine | null>(null);
  const viewRef = useRef<Viewport | null>(null);
  const styleRef = useRef<StrokeStyle>({ tool, color, size, alpha, contour, toBackground, hue: 20 });
  const stickerRef = useRef(sticker);
  stickerRef.current = sticker;
  const live = useRef({ tool, color, size, alpha, contour, toBackground });
  live.current = { tool, color, size, alpha, contour, toBackground };
  const actions = useRef(0);
  const dirty = useRef(false);
  const timer = useRef(0);
  const flags = useRef({ createdAt: Date.now(), completed: false, favorite: false });
  const titleRef = useRef('Рисунок');
  styleRef.current = { tool, color, size, alpha, contour, toBackground, hue: Math.round(hue) };

  useEffect(() => {
    let dead = false;
    void (async () => {
      const page = pageId === 'free-draw' ? freePage : await loadPage(pageId);
      const meta = drawingId ? (await drawingDb.list()).find((item) => item.id === drawingId) ?? null : await drawingDb.latestForPage(page.id);
      const id = drawingId ?? meta?.id ?? crypto.randomUUID();
      if (!drawingId) {
        if (!dead) go(page.id === 'free-draw' ? { name: 'free', drawingId: id } : { name: 'editor', pageId: page.id, drawingId: id }, true);
        return;
      }
      const payload = await drawingDb.payload(id);
      if (dead) return;
      flags.current = {
        createdAt: meta?.createdAt ?? Date.now(),
        completed: meta?.completed ?? false,
        favorite: meta?.favorite ?? false,
      };
      titleRef.current = meta?.title ?? page.title;
      setContour(payload?.contour ?? (page.id === 'free-draw' ? false : useSettings.getState().contour));
      if (payload) {
        setBackground(payload.background);
        setTool(payload.tool.name);
        setColor(payload.tool.color);
        setSize(payload.tool.size);
        setAlpha(payload.tool.alpha);
        setToBackground(payload.tool.toBackground);
      }
      setSession({ page, drawingId: id, payload, title: meta?.title ?? page.title });
      useSettings.getState().set({ resume: { pageId: page.id, drawingId: id } });
    })();
    return () => {
      dead = true;
      useSettings.getState().set({ resume: null });
    };
  }, [pageId, drawingId, go]);

  useEffect(() => {
    if (!session || !fillRef.current || !paintRef.current || !frameRef.current || !worldRef.current || !overlayRef.current) return;
    let ready = false;
    const engine = new DrawingEngine(fillRef.current, paintRef.current, session.page, (state) => {
      setHistory(state);
      if (!ready) return;
      setStickersOnCanvas(engine.getStickers());
      dirty.current = true;
      schedule();
    });
    const viewport = new Viewport(frameRef.current, worldRef.current);
    engineRef.current = engine;
    viewRef.current = viewport;
    if (session.payload) {
      engine.load(session.payload.ops, session.payload.background);
      engine.setBackground(session.payload.background);
      viewport.fit();
      if (session.payload.view.zoom > 1.05) viewport.zoomBy(session.payload.view.zoom);
      setStickersOnCanvas(engine.getStickers());
    } else if (session.page.id === 'free-draw') engine.setBackground('white');
    ready = true;
    const unbind = bindPointers(overlayRef.current, viewport, engine, {
      getStyle: () => styleRef.current,
      onSticker: (point) => {
        const current = engineRef.current;
        if (!current) return;
        const hit = current.getStickers().find((item) => Math.hypot(item.x - point.x, item.y - point.y) < 22 * item.scale);
        if (hit) {
          setSelected(hit.id);
          current.selectedId = hit.id;
          return;
        }
        current.addSticker({
          id: crypto.randomUUID(),
          kind: stickerRef.current,
          x: point.x,
          y: point.y,
          scale: 1,
          rotation: 0,
          color: styleRef.current.color,
        });
        setSelected(current.selectedId);
        setStickersOnCanvas(current.getStickers());
      },
      onAction: (kind) => {
        actions.current += 1;
        const every = praiseEvery(useSettings.getState().praiseFrequency);
        if (useSettings.getState().praise && actions.current % every === 0) showPraise();
        if (kind === 'fill') playFill();
      },
    });
    const onResize = () => viewport.resize();
    const observer = new ResizeObserver(onResize);
    observer.observe(frameRef.current);
    const flush = () => void saveNow();
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') return;
      event.preventDefault();
      if (event.shiftKey) engine.redo();
      else engine.undo();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      ready = false;
      unbind();
      observer.disconnect();
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('keydown', onKey);
      void saveNow();
      viewport.destroy();
      engineRef.current = null;
      viewRef.current = null;
    };
  }, [session]);

  const schedule = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void saveNow(), 700);
  };
  const saveNow = async () => {
    const engine = engineRef.current;
    const viewport = viewRef.current;
    if (!engine || !session || !viewport) return;
    if (!dirty.current && !session.payload && engine.ops().length === 0) return;
    setStatus('Сохраняем...');
    try {
      const thumb = await engine.thumbnail();
      const now = Date.now();
      await drawingDb.save(
        {
          schemaVersion: 1,
          id: session.drawingId,
          pageId: session.page.id,
          title: titleRef.current,
          createdAt: flags.current.createdAt,
          updatedAt: now,
          completed: flags.current.completed,
          favorite: flags.current.favorite,
          thumb,
        },
        {
          schemaVersion: 1,
          id: session.drawingId,
          ops: engine.ops(),
          background: engine.getBackground(),
          contour: live.current.contour,
          view: viewport.snapshot(),
          tool: {
            name: live.current.tool,
            color: live.current.color,
            size: live.current.size,
            alpha: live.current.alpha,
            toBackground: live.current.toBackground,
          },
        },
      );
      dirty.current = false;
      setStatus('Сохранено');
    } catch (error) {
      setStatus(storageErrorText(error));
    }
  };

  const chooseTool = (next: ToolName) => {
    playTool();
    setTool(next);
    const preset = sizes[next];
    setSize(preset.size);
    setAlpha(preset.alpha);
  };
  const chooseColor = (hex: string) => {
    playColor();
    setColor(hex);
  };
  const tweakSticker = (patch: { scale?: number; rotation?: number }) => {
    const engine = engineRef.current;
    if (!engine || !selected) return;
    const current = engine.getStickers().find((item) => item.id === selected);
    if (!current) return;
    engine.updateSticker(selected, {
      scale: Math.min(3, Math.max(0.4, patch.scale ?? current.scale)),
      rotation: patch.rotation ?? current.rotation,
    });
    setStickersOnCanvas(engine.getStickers());
  };

  if (!session) return <main className="screen"><p className="note">Открываем краски…</p></main>;
  const swatches = group === 'favorite'
    ? settings.favoriteColors.map((hex) => ({ id: hex, name: 'Любимый', hex, group: 'favorite' as const }))
    : palette.filter((item) => item.group === group);

  return (
    <main className="editor">
      <header className="editor-top">
        <button type="button" className="icon-btn" aria-label="Назад" onClick={() => setLeave(true)}><ChevronLeft /></button>
        <b>{session.title}</b>
        <button type="button" className="icon-btn" aria-label="Отменить" disabled={!history.canUndo} onClick={() => engineRef.current?.undo()}><Undo2 /></button>
        <button type="button" className="icon-btn" aria-label="Повторить" disabled={!history.canRedo} onClick={() => engineRef.current?.redo()}><Redo2 /></button>
        <button type="button" className="icon-btn" aria-label="Сохранить" onClick={() => { dirty.current = true; void saveNow().then(() => { playSave(); showPraise('Супер!'); }); }}><Save /></button>
        <span className="status">{status}</span>
      </header>
      <aside className="rail glass">
        {tools.map((item) => (
          <button key={item.id} type="button" className={tool === item.id ? 'tool active' : 'tool'} aria-pressed={tool === item.id} onClick={() => chooseTool(item.id)}>
            <item.icon size={22} />
            {item.label}
          </button>
        ))}
        <button type="button" className="tool" onClick={() => setMore((value) => !value)}>Ещё</button>
      </aside>
      <section className="stage" ref={frameRef}>
        <div className="world" ref={worldRef} style={{ background: backgroundCss(background) }}>
          <canvas ref={fillRef} className="layer" />
          <canvas ref={paintRef} className="layer" />
          <PageSvg page={session.page} debug={settings.debugRegions} />
          <svg className="stickers layer" viewBox="0 0 400 400" aria-hidden="true">
            {stickersOnCanvas.map((item) => (
              <g key={item.id} transform={`translate(${item.x} ${item.y}) rotate(${(item.rotation * 180) / Math.PI}) scale(${item.scale})`}>
                <circle r="16" fill={item.color} opacity={item.id === selected ? 1 : 0.95} />
                {item.id === selected ? <circle r="20" fill="none" stroke="#ff6b93" strokeWidth="2" /> : null}
              </g>
            ))}
          </svg>
          <div className="overlay" ref={overlayRef} />
        </div>
        <div className="zoom-controls">
          <button type="button" aria-label="Увеличить" onClick={() => viewRef.current?.zoomBy(1.15)}><ZoomIn size={18} /></button>
          <button type="button" aria-label="Уменьшить" onClick={() => viewRef.current?.zoomBy(0.87)}><Minus size={18} /></button>
          <button type="button" aria-label="По размеру экрана" onClick={() => viewRef.current?.fit()}>1:1</button>
        </div>
      </section>
      <footer className={sheetOpen ? 'dock glass open' : 'dock glass'}>
        <button
          type="button"
          className="sheet-handle"
          aria-label={sheetOpen ? 'Свернуть панель' : 'Открыть панель'}
          aria-expanded={sheetOpen}
          onPointerDown={(event) => { sheetDrag.current = event.clientY; }}
          onPointerUp={(event) => {
            const delta = sheetDrag.current - event.clientY;
            if (delta > 28) setSheetOpen(true);
            else if (delta < -28) setSheetOpen(false);
            else setSheetOpen((value) => !value);
          }}
        >
          <span />
        </button>
        <div className="tool-row">
          {tools.map((item) => (
            <button key={item.id} type="button" className={tool === item.id ? 'tool active' : 'tool'} aria-pressed={tool === item.id} onClick={() => chooseTool(item.id)}>
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
          <button type="button" className="tool" onClick={() => setMore((value) => !value)}>Ещё</button>
        </div>
        {more ? (
          <div className="tool-row">
            {extraTools.map((item) => (
              <button key={item.id} type="button" className={tool === item.id ? 'tool active' : 'tool'} onClick={() => chooseTool(item.id)}>
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
            {stickers.map((kind) => (
              <button key={kind} type="button" className={sticker === kind ? 'chip active' : 'chip'} onClick={() => { setSticker(kind); chooseTool('sticker'); }}>{kind}</button>
            ))}
            <button type="button" className="ghost" onClick={() => { setDone(true); playDone(); }}>Готово</button>
          </div>
        ) : null}
        {tool !== 'bucket' && tool !== 'pan' && tool !== 'sticker' ? (
          <div className="row">
            {[8, 14, 24, 36].map((preset) => (
              <button key={preset} type="button" className={Math.round(size) === preset ? 'chip active' : 'chip'} onClick={() => setSize(preset)}>{preset < 12 ? 'S' : preset < 20 ? 'M' : preset < 30 ? 'L' : 'XL'}</button>
            ))}
            <input className="slider" aria-label="Размер" type="range" min={3} max={40} value={size} onChange={(event) => setSize(Number(event.target.value))} />
            {tool !== 'eraser' ? <input className="slider" aria-label="Прозрачность" type="range" min={0.08} max={1} step={0.02} value={alpha} onChange={(event) => setAlpha(Number(event.target.value))} /> : null}
          </div>
        ) : null}
        <div className="row">
          <button type="button" className={contour ? 'chip active' : 'chip'} aria-pressed={contour} onClick={() => setContour((value) => !value)}>Внутри контуров</button>
          {tool === 'eraser' ? <button type="button" className={toBackground ? 'chip active' : 'chip'} onClick={() => setToBackground((value) => !value)}>Стирать до фона</button> : null}
          {selected ? (
            <>
              <button type="button" className="icon-btn" aria-label="Больше" onClick={() => tweakSticker({ scale: (stickersOnCanvas.find((item) => item.id === selected)?.scale ?? 1) * 1.15 })}><Plus /></button>
              <button type="button" className="icon-btn" aria-label="Меньше" onClick={() => tweakSticker({ scale: (stickersOnCanvas.find((item) => item.id === selected)?.scale ?? 1) * 0.87 })}><Minus /></button>
              <button type="button" className="ghost" onClick={() => tweakSticker({ rotation: (stickersOnCanvas.find((item) => item.id === selected)?.rotation ?? 0) + 0.4 })}>Повернуть</button>
              <button type="button" className="ghost" onClick={() => { engineRef.current?.deleteSticker(selected); setSelected(null); setStickersOnCanvas(engineRef.current?.getStickers() ?? []); }}>Убрать</button>
            </>
          ) : null}
        </div>
        <div className="chip-row">
          {colorGroups.map((item) => (
            <button key={item.id} type="button" className={group === item.id ? 'chip active' : 'chip'} onClick={() => setGroup(item.id)}>{item.title}</button>
          ))}
        </div>
        <div className="swatches">
          {swatches.map((item) => (
            <button key={item.id} type="button" className={color === item.hex ? 'swatch active' : 'swatch'} style={{ background: item.hex }} aria-label={item.name} aria-pressed={color === item.hex} onClick={() => chooseColor(item.hex)} />
          ))}
          <button type="button" className={picker ? 'swatch active' : 'swatch'} style={{ background: hslToHex(hue, sat, light) }} aria-label="Свой цвет" aria-pressed={picker} onClick={() => { setPicker((value) => !value); chooseColor(hslToHex(hue, sat, light)); }} />
          <button type="button" className="ghost" onClick={() => settings.toggleColor(color)}>В любимые</button>
        </div>
        {picker ? (
          <div className="row">
            <input className="slider" aria-label="Оттенок" type="range" min={0} max={360} value={hue} onChange={(event) => { const next = Number(event.target.value); setHue(next); chooseColor(hslToHex(next, sat, light)); }} />
            <input className="slider" aria-label="Насыщенность" type="range" min={0} max={100} value={sat} onChange={(event) => { const next = Number(event.target.value); setSat(next); chooseColor(hslToHex(hue, next, light)); }} />
            <input className="slider" aria-label="Яркость" type="range" min={10} max={95} value={light} onChange={(event) => { const next = Number(event.target.value); setLight(next); chooseColor(hslToHex(hue, sat, next)); }} />
          </div>
        ) : null}
        <div className="row">
          {backgrounds.map((item) => (
            <button key={item.id} type="button" className={background === item.id ? 'chip active' : 'chip'} onClick={() => { setBackground(item.id); engineRef.current?.setBackground(item.id); dirty.current = true; schedule(); }}>{item.title}</button>
          ))}
        </div>
      </footer>
      {leave ? (
        <Modal title="Сохранить и вернуться?">
          <p className="note">Рисунок останется в «Моих рисунках».</p>
          <div className="row">
            <button type="button" className="primary" onClick={() => { dirty.current = true; void saveNow().then(() => go({ name: 'home' })); }}>Сохранить и назад</button>
            <button type="button" className="ghost" onClick={() => setLeave(false)}>Ещё рисовать</button>
          </div>
        </Modal>
      ) : null}
      {done ? (
        <Modal title="Ура! Твой шедевр готов!">
          <p className="note">Можно ещё украсить или выбрать новую картинку.</p>
          <div className="row">
            <button type="button" className="primary" onClick={() => { setDone(false); }}>Продолжить украшать</button>
            <button type="button" className="ghost" onClick={() => { flags.current.completed = true; void drawingDb.patchMeta(session.drawingId, { completed: true }); setDone(false); }}>Посмотреть рисунок</button>
            <button type="button" className="ghost" onClick={() => go({ name: 'collections' })}>Новая раскраска</button>
          </div>
        </Modal>
      ) : null}
    </main>
  );
};
