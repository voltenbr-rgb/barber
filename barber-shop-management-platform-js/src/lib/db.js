const LS_KEY = "barberpro:future:db:v1";
const IDB_NAME = "barberpro-future";
const IDB_STORE = "snapshots";
const hasIDB = () => typeof indexedDB !== "undefined";
const openDB = () => new Promise((resolve, reject) => {
  const req = indexedDB.open(IDB_NAME, 1);
  req.onupgradeneeded = () => {
    if (!req.result.objectStoreNames.contains(IDB_STORE)) {
      req.result.createObjectStore(IDB_STORE);
    }
  };
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});
const mirrorSnapshot = async (data) => {
  if (!hasIDB()) return;
  try {
    const db = await openDB();
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(JSON.parse(JSON.stringify(data)), "latest");
  } catch {
  }
};
const readIndexedSnapshot = async () => {
  if (!hasIDB()) return null;
  try {
    const db = await openDB();
    const tx = db.transaction(IDB_STORE, "readonly");
    return await new Promise((resolve, reject) => {
      const req = tx.objectStore(IDB_STORE).get("latest");
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
};
const loadSnapshot = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.companies?.length || !Array.isArray(parsed.appointments)) return null;
    return parsed;
  } catch {
    return null;
  }
};
const saveSnapshot = (data) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {
  }
  void mirrorSnapshot(data);
};
const clearSnapshot = () => {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
  }
};
export {
  clearSnapshot,
  loadSnapshot,
  mirrorSnapshot,
  readIndexedSnapshot,
  saveSnapshot
};
