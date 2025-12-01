import { browser } from "$app/environment";

const DB_NAME = "fundrealvalue";
const DB_VERSION = 2;
const STORE_NAME = "kv";

function idbRequest<T>(req: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB() {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getDB() {
    if (!browser) throw new Error("IndexedDB only works in the browser");
    if (!dbPromise) dbPromise = openDB();
    return dbPromise;
}

export class LocalDB {
    static async set(key: string, value: any) {
        const db = await getDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        // ensure cloneable
        const safeValue = JSON.parse(JSON.stringify(value));

        return idbRequest(store.put(safeValue, key));
    }


    static async get(key: string) {
        const db = await getDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);

        const value = await idbRequest(store.get(key));
        if (value === undefined) return null;
        try {
            return JSON.parse(JSON.stringify(value));
        } catch {
            return value;
        }
    }


    static async remove(key: string) {
        const db = await getDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        return idbRequest(store.delete(key));
    }
}