import { Postit, Arrow } from '../types';

const DB_NAME = 'PostitBoardDB';
const STORE_NAME = 'diagrams';

interface DiagramData {
  postits: Postit[];
  arrows: Arrow[];
  timestamp?: number;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    };
  });
};

export const saveToIndexedDB = async (data: DiagramData): Promise<IDBValidKey> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ ...data, timestamp: Date.now() });
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const loadFromIndexedDB = async (): Promise<DiagramData[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const loadFromBrowser = async (): Promise<DiagramData | null> => {
  const lastSave = localStorage.getItem('lastSave');
  if (lastSave) {
    return JSON.parse(lastSave) as DiagramData;
  }
  const indexedDBData = await loadFromIndexedDB();
  return indexedDBData.length > 0 ? indexedDBData[indexedDBData.length - 1] : null;
};