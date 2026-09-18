import type { GoogleDriveFolder, MasterFolder } from "./google-drive/types";
import type { BackgroundRequest, BackgroundResponse } from "./google-drive/messages";

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

async function send(request: BackgroundRequest): Promise<BackgroundResponse> {
  return chrome.runtime.sendMessage(request);
}

function getError(response: BackgroundResponse): string {
  return response.ok ? "Unexpected response from TreeSpace background service." : response.error;
}
