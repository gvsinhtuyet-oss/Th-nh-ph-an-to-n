// IndexedDB Wrapper for "Thành Phố An Toàn"
const DB_NAME = 'thanh_pho_an_toan_db';
const DB_VERSION = 3;

export const STORES = {
  STUDENT_PROFILE: 'studentProfile',
  JOURNEYS: 'journeys',
  MISSIONS: 'missions',
  LEARNING_TASKS: 'learningTasks',
  PROGRESS: 'progress',
  STOP_PROGRESS: 'stopProgress',
  TASK_PROGRESS: 'taskProgress',
  INVENTORY: 'inventory',
  KNOWLEDGE_NOTEBOOK: 'knowledgeNotebook',
  CERTIFICATES: 'certificates',
  VERIFIED_KNOWLEDGE: 'verifiedKnowledge',
  OFFLINE_PACKAGES: 'offlinePackages',
  SYNC_QUEUE: 'syncQueue',
  SETTINGS: 'settings',
  EVIDENCE: 'evidence',
} as const;

type StoreName = typeof STORES[keyof typeof STORES];

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORES.STUDENT_PROFILE)) {
        db.createObjectStore(STORES.STUDENT_PROFILE, { keyPath: 'localUuid' });
      }
      if (!db.objectStoreNames.contains(STORES.JOURNEYS)) {
        db.createObjectStore(STORES.JOURNEYS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
        db.createObjectStore(STORES.PROGRESS, { keyPath: 'journeyId' });
      }
      if (!db.objectStoreNames.contains(STORES.INVENTORY)) {
        db.createObjectStore(STORES.INVENTORY, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.KNOWLEDGE_NOTEBOOK)) {
        db.createObjectStore(STORES.KNOWLEDGE_NOTEBOOK, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.CERTIFICATES)) {
        db.createObjectStore(STORES.CERTIFICATES, { keyPath: 'journeyId' });
      }
      if (!db.objectStoreNames.contains(STORES.VERIFIED_KNOWLEDGE)) {
        db.createObjectStore(STORES.VERIFIED_KNOWLEDGE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.OFFLINE_PACKAGES)) {
        db.createObjectStore(STORES.OFFLINE_PACKAGES, { keyPath: 'journeyId' });
      }
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.EVIDENCE)) {
        db.createObjectStore(STORES.EVIDENCE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.MISSIONS)) {
        db.createObjectStore(STORES.MISSIONS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.STOP_PROGRESS)) {
        db.createObjectStore(STORES.STOP_PROGRESS, { keyPath: 'stopId' });
      }
      if (!db.objectStoreNames.contains(STORES.LEARNING_TASKS)) {
        db.createObjectStore(STORES.LEARNING_TASKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.TASK_PROGRESS)) {
        db.createObjectStore(STORES.TASK_PROGRESS, { keyPath: 'taskId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

export async function idbGet<T>(storeName: StoreName, key: IDBValidKey): Promise<T | null> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // LocalStorage fallback
    const fallback = localStorage.getItem(`tpat_${storeName}_${String(key)}`);
    return fallback ? JSON.parse(fallback) : null;
  }
}

export async function idbGetAll<T>(storeName: StoreName): Promise<T[]> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(`tpat_${storeName}_`));
    return keys.map(k => JSON.parse(localStorage.getItem(k) || 'null')).filter(Boolean);
  }
}

export async function idbPut<T>(storeName: StoreName, value: T): Promise<void> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(value);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const key = (value as any).id || (value as any).journeyId || (value as any).localUuid || (value as any).key;
    if (key) {
      localStorage.setItem(`tpat_${storeName}_${key}`, JSON.stringify(value));
    }
  }
}

export async function idbDelete(storeName: StoreName, key: IDBValidKey): Promise<void> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    localStorage.removeItem(`tpat_${storeName}_${String(key)}`);
  }
}

export async function idbClear(storeName: StoreName): Promise<void> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(`tpat_${storeName}_`));
    keys.forEach(k => localStorage.removeItem(k));
  }
}
