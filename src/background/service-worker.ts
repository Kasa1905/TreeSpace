import { ChromeIdentityAuth } from "../services/google-drive/auth";
import { GoogleDriveApi } from "../services/google-drive/drive-api";
import { GoogleDriveTreeBuilder } from "../services/google-drive/tree-builder";
import type { BackgroundRequest, BackgroundResponse } from "../services/google-drive/messages";
import { chromeStorage, MasterFolderStore } from "../services/storage/master-folder-store";

const auth = new ChromeIdentityAuth();
const driveApi = new GoogleDriveApi(auth);
const treeBuilder = new GoogleDriveTreeBuilder(driveApi);
const masterFolderStore = new MasterFolderStore(chromeStorage);

chrome.runtime.onInstalled.addListener(() => {
  console.info("TreeSpace service worker installed");
});

chrome.runtime.onMessage.addListener((request: BackgroundRequest, _sender, sendResponse) => {
  void handleRequest(request)
    .then(sendResponse)
    .catch((error: unknown) => {
      sendResponse({ ok: false, error: getErrorMessage(error) } satisfies BackgroundResponse);
    });

  return true;
});

async function handleRequest(request: BackgroundRequest): Promise<BackgroundResponse> {
  switch (request.type) {
    case "get-session":
      return getSession(false);
    case "sign-in":
      return getSession(true);
    case "list-folders":
      return { ok: true, folders: await driveApi.listFolders(request.parentId) };
    case "get-master-folder":
      return { ok: true, masterFolder: await masterFolderStore.get() };
    case "set-master-folder":
      await masterFolderStore.set(request.folder);
      return { ok: true };
    case "build-tree": {
      const masterFolder = await masterFolderStore.get();
      if (!masterFolder) {
        throw new Error("Choose a Master Folder before building the TreeSpace tree.");
      }
      return { ok: true, tree: await treeBuilder.build(masterFolder) };
    }
  }
}

async function getSession(interactive: boolean): Promise<BackgroundResponse> {
  const manifest = chrome.runtime.getManifest();
  const clientId = manifest.oauth2?.client_id;
  if (!clientId || clientId === "__TREESPACE_GOOGLE_CLIENT_ID__") {
    throw new Error("Google OAuth is not configured. Set TREESPACE_GOOGLE_CLIENT_ID and rebuild the extension.");
  }

  await auth.getToken(interactive);
  return { ok: true, authenticated: true };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "TreeSpace could not complete the request.";
}
