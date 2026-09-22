import type { GoogleDriveFolder, MasterFolder } from "./google-drive/types";
import type { BackgroundRequest, BackgroundResponse } from "./google-drive/messages";
import type { TreeBuildResult } from "./google-drive/tree-builder";

export async function getSession(): Promise<{ authenticated: boolean }> {
  const response = await send({ type: "get-session" });
  if (response.ok && "authenticated" in response) {
    return { authenticated: response.authenticated };
  }
  throw new Error(getError(response));
}

export async function signIn(): Promise<{ authenticated: boolean }> {
  const response = await send({ type: "sign-in" });
  if (response.ok && "authenticated" in response) {
    return { authenticated: response.authenticated };
  }
  throw new Error(getError(response));
}

export async function listFolders(parentId: string): Promise<GoogleDriveFolder[]> {
  const response = await send({ type: "list-folders", parentId });
  if (response.ok && "folders" in response) {
    return response.folders;
  }
  throw new Error(getError(response));
}

export async function getMasterFolder(): Promise<MasterFolder | undefined> {
  const response = await send({ type: "get-master-folder" });
  if (response.ok && "masterFolder" in response) {
    return response.masterFolder;
  }
  throw new Error(getError(response));
}

export async function setMasterFolder(folder: MasterFolder): Promise<void> {
  const response = await send({ type: "set-master-folder", folder });
  if (!response.ok) {
    throw new Error(getError(response));
  }
}

export async function buildTree(): Promise<TreeBuildResult> {
  return requestTree("build-tree");
}

export async function refreshTree(): Promise<TreeBuildResult> {
  return requestTree("refresh-tree");
}

async function requestTree(type: "build-tree" | "refresh-tree"): Promise<TreeBuildResult> {
  const response = await send({ type });
  if (response.ok && "tree" in response) {
    return response.tree;
  }
  throw new Error(getError(response));
}

async function send(request: BackgroundRequest): Promise<BackgroundResponse> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error(`TreeSpace background service timed out handling ${request.type}.`));
      }
    }, 10_000);

    const finish = (callback: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      callback();
    };

    try {
      chrome.runtime.sendMessage(request, (response?: BackgroundResponse) => {
        const runtimeError = chrome.runtime.lastError;
        if (runtimeError) {
          finish(() => reject(new Error(runtimeError.message || "TreeSpace background service unavailable.")));
          return;
        }

        if (!response || typeof response.ok !== "boolean") {
          finish(() => reject(new Error("TreeSpace background service returned no response.")));
          return;
        }

        finish(() => resolve(response));
      });
    } catch (error: unknown) {
      finish(() => reject(error instanceof Error ? error : new Error("TreeSpace message transport failed.")));
    }
  });
}

function getError(response: BackgroundResponse): string {
  if (!response.ok) {
    return response.error;
  }

  return "TreeSpace background service returned an incomplete response.";
}
