import type { MasterFolder } from "../google-drive/types";

export interface KeyValueStorage {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

export const MASTER_FOLDER_STORAGE_KEY = "treespace.masterFolder";

export class MasterFolderStore {
  constructor(private readonly storage: KeyValueStorage) {}

  get(): Promise<MasterFolder | undefined> {
    return this.storage.get<MasterFolder>(MASTER_FOLDER_STORAGE_KEY);
  }

  set(folder: MasterFolder): Promise<void> {
    return this.storage.set(MASTER_FOLDER_STORAGE_KEY, folder);
  }

  clear(): Promise<void> {
    return this.storage.remove(MASTER_FOLDER_STORAGE_KEY);
  }
}

export const chromeStorage: KeyValueStorage = {
  async get<T>(key: string) {
    const result = await chrome.storage.local.get(key);
    return result[key] as T | undefined;
  },
  set<T>(key: string, value: T) {
    return chrome.storage.local.set({ [key]: value });
  },
  remove(key: string) {
    return chrome.storage.local.remove(key);
  }
};
