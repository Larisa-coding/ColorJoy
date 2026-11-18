import { isMeta, isPayload, type DrawingMeta, type DrawingPayload } from './types';

const memory = {
  metas: [] as DrawingMeta[],
  payloads: [] as DrawingPayload[],
};

let dbPromise: Promise<IDBDatabase | null> | null = null;

const openDb = (): Promise<IDBDatabase | null> => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    const request = indexedDB.open('colorjoy', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('drawings')) db.createObjectStore('drawings', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('payloads')) db.createObjectStore('payloads', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
  return dbPromise;
};

const txDone = (tx: IDBTransaction) =>
  new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });

let queue: Promise<unknown> = Promise.resolve();

const enqueue = <T>(task: () => Promise<T>): Promise<T> => {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
};

const readMetas = async (): Promise<DrawingMeta[]> => {
  const db = await openDb();
  if (!db) return memory.metas.map((item) => ({ ...item })).sort((a, b) => b.updatedAt - a.updatedAt);
  const tx = db.transaction('drawings', 'readonly');
  const request = tx.objectStore('drawings').getAll();
  const rows = await new Promise<unknown[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as unknown[]);
    request.onerror = () => reject(request.error);
  });
  return rows.filter(isMeta).sort((a, b) => b.updatedAt - a.updatedAt);
};

export const drawingDb = {
  list: () => enqueue(readMetas),

  payload: (id: string) =>
    enqueue(async () => {
      const db = await openDb();
      if (!db) return memory.payloads.find((item) => item.id === id) ?? null;
      const tx = db.transaction('payloads', 'readonly');
      const request = tx.objectStore('payloads').get(id);
      const row = await new Promise<unknown>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      return isPayload(row) ? row : null;
    }),

  latestForPage: (pageId: string) =>
    enqueue(async () => {
      const all = await readMetas();
      return all.find((item) => item.pageId === pageId) ?? null;
    }),

  save: (meta: DrawingMeta, payload: DrawingPayload) =>
    enqueue(async () => {
      const db = await openDb();
      if (!db) {
        memory.metas = [meta, ...memory.metas.filter((item) => item.id !== meta.id)];
        memory.payloads = [payload, ...memory.payloads.filter((item) => item.id !== payload.id)];
        return;
      }
      const tx = db.transaction(['drawings', 'payloads'], 'readwrite');
      tx.objectStore('drawings').put(meta);
      tx.objectStore('payloads').put(payload);
      await txDone(tx);
    }),

  patchMeta: (id: string, patch: Partial<DrawingMeta>) =>
    enqueue(async () => {
      const db = await openDb();
      if (!db) {
        memory.metas = memory.metas.map((item) => (item.id === id ? { ...item, ...patch } : item));
        return;
      }
      const tx = db.transaction('drawings', 'readwrite');
      const store = tx.objectStore('drawings');
      const current = await new Promise<unknown>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      if (isMeta(current)) store.put({ ...current, ...patch, id });
      await txDone(tx);
    }),

  remove: (id: string) =>
    enqueue(async () => {
      const db = await openDb();
      if (!db) {
        memory.metas = memory.metas.filter((item) => item.id !== id);
        memory.payloads = memory.payloads.filter((item) => item.id !== id);
        return;
      }
      const tx = db.transaction(['drawings', 'payloads'], 'readwrite');
      tx.objectStore('drawings').delete(id);
      tx.objectStore('payloads').delete(id);
      await txDone(tx);
    }),

  clear: () =>
    enqueue(async () => {
      memory.metas = [];
      memory.payloads = [];
      const db = await openDb();
      if (!db) return;
      const tx = db.transaction(['drawings', 'payloads'], 'readwrite');
      tx.objectStore('drawings').clear();
      tx.objectStore('payloads').clear();
      await txDone(tx);
    }),
};

export const storageErrorText = (error: unknown): string => {
  if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
    return 'Память устройства заполнена. Удали старые рисунки в галерее.';
  }
  return 'Не получилось сохранить. Рисунок ещё на экране — попробуй ещё раз.';
};
