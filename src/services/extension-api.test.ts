import {
  buildTree,
  getMasterFolder,
  getSession,
  listFolders,
  refreshTree,
  setMasterFolder,
  signIn
} from "./extension-api";
import type { BackgroundRequest, BackgroundResponse } from "./google-drive/messages";
import type { MasterFolder } from "./google-drive/types";
import type { TreeBuildResult } from "./google-drive/tree-builder";

interface MockRuntime {
  lastError?: { message: string };
  sendMessage: ReturnType<typeof vi.fn>;
}

let runtime: MockRuntime;

const masterFolder: MasterFolder = {
  id: "folder-1",
  name: "Projects",
  provider: "google-drive",
  url: "https://drive.google.com/drive/folders/folder-1"
};

const treeResult: TreeBuildResult = {
  tree: {
    id: "folder-1",
    name: "Projects",
    type: "folder",
    size: 0,
    url: masterFolder.url,
    children: []
  },
  errors: [],
  complete: true
};

describe("extension API messaging", () => {
  beforeEach(() => {
    runtime = {
      sendMessage: vi.fn()
    };
    vi.stubGlobal("chrome", { runtime });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function respond(response: BackgroundResponse, delay = 0) {
    runtime.sendMessage.mockImplementation((_request: BackgroundRequest, callback: (response: BackgroundResponse) => void) => {
      setTimeout(() => callback(response), delay);
    });
  }

  it("returns successful authentication data", async () => {
    respond({ ok: true, authenticated: true });

    await expect(getSession()).resolves.toEqual({ authenticated: true });
    expect(runtime.sendMessage).toHaveBeenCalledWith({ type: "get-session" }, expect.any(Function));
  });

  it("returns data payloads from folder and tree requests", async () => {
    respond({ ok: true, folders: [{ id: "folder-1", name: "Projects", mimeType: "application/vnd.google-apps.folder" }] });
    await expect(listFolders("root")).resolves.toHaveLength(1);

    respond({ ok: true, tree: treeResult });
    await expect(buildTree()).resolves.toEqual(treeResult);

    respond({ ok: true, tree: treeResult });
    await expect(refreshTree()).resolves.toEqual(treeResult);
  });

  it("keeps async responses pending until the callback arrives", async () => {
    respond({ ok: true, authenticated: true }, 10);

    let settled = false;
    const request = signIn().then(() => {
      settled = true;
    });

    await new Promise((resolve) => setTimeout(resolve, 1));
    expect(settled).toBe(false);
    await request;
    expect(settled).toBe(true);
  });

  it("returns the background error payload", async () => {
    respond({ ok: false, error: "Permission denied" });

    await expect(getMasterFolder()).rejects.toThrow("Permission denied");
  });

  it("handles successful mutation responses", async () => {
    respond({ ok: true });

    await expect(setMasterFolder(masterFolder)).resolves.toBeUndefined();
  });

  it("surfaces runtime.lastError from the messaging channel", async () => {
    runtime.lastError = { message: "The message port closed before a response was received." };
    runtime.sendMessage.mockImplementation((_request: BackgroundRequest, callback: (response?: BackgroundResponse) => void) => {
      callback(undefined);
    });

    await expect(getSession()).rejects.toThrow("The message port closed before a response was received.");
  });

  it("rejects an undefined or invalid response", async () => {
    runtime.sendMessage.mockImplementation((_request: BackgroundRequest, callback: (response?: BackgroundResponse) => void) => {
      callback(undefined);
    });

    await expect(getSession()).rejects.toThrow("TreeSpace background service returned no valid response.");
  });

  it("identifies an incomplete success response", async () => {
    respond({ ok: true } as BackgroundResponse);

    await expect(getSession()).rejects.toThrow("TreeSpace background service returned an incomplete response.");
  });
});
