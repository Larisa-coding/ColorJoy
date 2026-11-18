import { useMemo, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { appConfig } from '@/config';
import { drawingDb } from '@/storage/db';
import type { DrawingMeta, DrawingPayload } from '@/storage/types';
import { useNav } from '@/store/nav';
import { useSettings } from '@/store/settings';
import { syncMusic } from '@/audio/sounds';

const blobToData = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

export const Parent = () => {
  const go = useNav((state) => state.go);
  const settings = useSettings();
  const puzzle = useMemo(() => {
    const a = 6 + Math.floor(Math.random() * 7);
    const b = 4 + Math.floor(Math.random() * 6);
    return { a, b, answer: String(a + b) };
  }, []);
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(!settings.kidMode);
  const [message, setMessage] = useState('');
  const [wrong, setWrong] = useState(false);

  const exportAll = async () => {
    const metas = await drawingDb.list();
    const drawings = await Promise.all(
      metas.map(async (meta) => ({
        ...meta,
        thumb: meta.thumb ? await blobToData(meta.thumb) : null,
        payload: await drawingDb.payload(meta.id),
      })),
    );
    const blob = new Blob([JSON.stringify({ schemaVersion: 1, app: appConfig.name, drawings })], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'colorjoy-drawings.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1500);
  };

  const importAll = async (file: File) => {
    const parsed = JSON.parse(await file.text()) as {
      drawings?: Array<DrawingMeta & { thumb: string | null; payload: DrawingPayload | null }>;
    };
    if (!parsed.drawings) throw new Error('Файл не похож на архив ColorJoy');
    for (const item of parsed.drawings) {
      if (!item.payload) continue;
      const thumb = item.thumb ? await (await fetch(item.thumb)).blob() : null;
      await drawingDb.save({ ...item, thumb, schemaVersion: 1 }, item.payload);
    }
    setMessage('Рисунки добавлены на это устройство.');
  };

  if (!open) {
    return (
      <main className="screen">
        <header className="topbar glass">
          <button type="button" className="icon-btn" aria-label="Назад" onClick={() => go({ name: 'home' })}><ChevronLeft /></button>
          <b>Для взрослых</b>
        </header>
        <section className="welcome glass" style={{ marginTop: 16 }}>
          <p className="note">Сколько будет {puzzle.a} + {puzzle.b}? Это проверка, что раздел открывает взрослый.</p>
          <input className="field" inputMode="numeric" aria-label="Ответ" value={value} onChange={(event) => setValue(event.target.value)} />
          <button type="button" className="primary" onClick={() => { const ok = value.trim() === puzzle.answer; setWrong(!ok); if (ok) setOpen(true); }}>Открыть</button>
          {wrong ? <p className="note">Пока не сходится.</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="screen">
      <header className="topbar glass">
        <button type="button" className="icon-btn" aria-label="Назад" onClick={() => go({ name: 'home' })}><ChevronLeft /></button>
        <b>Родительский раздел</b>
      </header>
      <section className="welcome glass" style={{ marginTop: 16, display: 'grid', gap: 10 }}>
        <label className="note">Звук интерфейса
          <input type="checkbox" checked={settings.sound} onChange={(event) => settings.set({ sound: event.target.checked })} />
        </label>
        <label className="note">Тихая музыка
          <input type="checkbox" checked={settings.music} onChange={(event) => { settings.set({ music: event.target.checked }); syncMusic(); }} />
        </label>
        <label className="note">Громкость
          <input className="slider" type="range" min={0} max={1} step={0.05} value={settings.volume} onChange={(event) => settings.set({ volume: Number(event.target.value) })} />
        </label>
        <label className="note">Похвала
          <input type="checkbox" checked={settings.praise} onChange={(event) => settings.set({ praise: event.target.checked })} />
        </label>
        <label className="note">Как часто хвалить
          <select value={settings.praiseFrequency} onChange={(event) => settings.set({ praiseFrequency: event.target.value as typeof settings.praiseFrequency })}>
            <option value="low">Редко</option>
            <option value="normal">Обычно</option>
            <option value="high">Часто</option>
          </select>
        </label>
        <label className="note">Анимации
          <select value={settings.motion} onChange={(event) => settings.set({ motion: event.target.value as typeof settings.motion })}>
            <option value="system">Как в системе</option>
            <option value="full">Обычные</option>
            <option value="reduced">Меньше</option>
          </select>
        </label>
        <label className="note">Детский режим: раздел для взрослых закрыт задачей
          <input type="checkbox" checked={settings.kidMode} onChange={(event) => settings.set({ kidMode: event.target.checked })} />
        </label>
        <label className="note">Раскрашивать внутри линий по умолчанию
          <input type="checkbox" checked={settings.contour} onChange={(event) => settings.set({ contour: event.target.checked })} />
        </label>
        <label className="note">Подсветить области разным цветом
          <input type="checkbox" checked={settings.debugRegions} onChange={(event) => settings.set({ debugRegions: event.target.checked })} />
        </label>
        <p className="note">Рисунки, настройки и избранное хранятся только на этом устройстве, в IndexedDB и LocalStorage. Аккаунта нет, на сервер ничего не отправляется.</p>
        <div className="row">
          <button type="button" className="ghost" onClick={() => void exportAll()}>Скачать архив</button>
          <label className="ghost">Загрузить архив
            <input type="file" accept="application/json" hidden onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importAll(file).catch(() => setMessage('Не удалось прочитать файл.'));
            }} />
          </label>
          <button type="button" className="danger" onClick={() => {
            const a = 3 + Math.floor(Math.random() * 5);
            const b = 3 + Math.floor(Math.random() * 5);
            const answer = window.prompt(`Удалить все рисунки на устройстве? Введите ${a} + ${b}`);
            if (answer?.trim() === String(a + b)) void drawingDb.clear().then(() => setMessage('Данные очищены.'));
          }}>Очистить данные</button>
        </div>
        {message ? <p className="note">{message}</p> : null}
        <h2>Как открывать как приложение</h2>
        <p className="note"><b>iPhone и iPad:</b> откройте сайт в Safari, нажмите «Поделиться», выберите «На экран Домой», включите «Открывать как веб-приложение», если такая кнопка есть, и добавьте на экран. Для дополнительной защиты можно включить системный «Гид-доступ».</p>
        <p className="note"><b>Android:</b> откройте сайт в Chrome, добавьте приложение на главный экран или согласитесь на установку, если браузер её предложит. При необходимости закрепите приложение системными средствами.</p>
        <p className="note">Сайт не может запретить системный жест выхода из приложения. Защита здесь — установка на экран, автосохранение и восстановление рисунка.</p>
        <p className="note">Лицензионные коллекции мультгероев не заполнены нарочно. Их можно подключить отдельными SVG, когда есть разрешение правообладателя. Свои работы при обновлении приложения не удаляются: схема данных версия {appConfig.schemaVersion}.</p>
      </section>
    </main>
  );
};
