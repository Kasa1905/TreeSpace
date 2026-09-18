import type { GoogleDriveFolder, MasterFolder } from "./types";
import type { TreeBuildResult } from "./tree-builder";

export type BackgroundRequest =
  | { type: "get-session" }
  | { type: "sign-in" }
  | { type: "list-folders"; parentId: string }
  | { type: "get-master-folder" }
  | { type: "set-master-folder"; folder: MasterFolder }
  | { type: "build-tree" }
  | { type: "refresh-tree" };

export type BackgroundResponse =
  | { ok: true; authenticated: boolean }
  | { ok: true; folders: GoogleDriveFolder[] }
  | { ok: true; masterFolder?: MasterFolder }
  | { ok: true; tree: TreeBuildResult }
  | { ok: true }
  | { ok: false; error: string };
