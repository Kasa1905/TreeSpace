import type { GoogleDriveFolder, MasterFolder } from "./types";

export type BackgroundRequest =
  | { type: "get-session" }
  | { type: "sign-in" }
  | { type: "list-folders"; parentId: string }
  | { type: "get-master-folder" }
  | { type: "set-master-folder"; folder: MasterFolder };

export type BackgroundResponse =
  | { ok: true; authenticated: boolean }
  | { ok: true; folders: GoogleDriveFolder[] }
  | { ok: true; masterFolder?: MasterFolder }
  | { ok: true }
  | { ok: false; error: string };
