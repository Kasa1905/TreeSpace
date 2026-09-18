import { MasterFolderStore, type KeyValueStorage } from "./master-folder-store";
import type { MasterFolder } from "../google-drive/types";

class MemoryStorage implements KeyValueStorage {
  private readonly values = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | undefined> {
    return this.values.get(key) as T | undefined;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.values.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.values.delete(key);
  }
}

describe("MasterFolderStore", () => {
  const folder: MasterFolder = {
    id: "folder-1",
    name: "Projects",
    provider: "google-drive",
    url: "https://drive.google.com/drive/folders/folder-1"
  };

  it("persists and retrieves the selected master folder", async () => {
    const store = new MasterFolderStore(new MemoryStorage());

    await store.set(folder);

    await expect(store.get()).resolves.toEqual(folder);
  });

  it("does not change the stored root during reads", async () => {
    const store = new MasterFolderStore(new MemoryStorage());
    await store.set(folder);

    await store.get();
    await store.get();

    await expect(store.get()).resolves.toEqual(folder);
  });
});
