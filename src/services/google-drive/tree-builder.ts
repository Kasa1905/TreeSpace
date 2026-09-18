import type { TreeNode } from "../../models/tree-node";
import type { MasterFolder, GoogleDriveItem } from "./types";
import type { GoogleDriveApi } from "./drive-api";

export type TraversalErrorKind = "folder-fetch" | "duplicate" | "invalid-item";

export interface TraversalError {
  kind: TraversalErrorKind;
  message: string;
  folderId?: string;
  nodeId?: string;
}

export interface TreeBuildProgress {
  foldersVisited: number;
  nodesCreated: number;
  currentFolderId?: string;
}

export interface TreeBuildResult {
  tree: TreeNode;
  errors: TraversalError[];
  complete: boolean;
}

export type TreeBuildProgressListener = (progress: TreeBuildProgress) => void;

export class GoogleDriveTreeBuilder {
  constructor(private readonly driveApi: Pick<GoogleDriveApi, "listChildren">) {}

  async build(
    masterFolder: MasterFolder,
    onProgress?: TreeBuildProgressListener
  ): Promise<TreeBuildResult> {
    const errors: TraversalError[] = [];
    const visitedFolderIds = new Set<string>([masterFolder.id]);
    const visitedNodeIds = new Set<string>([masterFolder.id]);
    const progress: TreeBuildProgress = {
      foldersVisited: 0,
      nodesCreated: 1,
      currentFolderId: masterFolder.id
    };

    const root: TreeNode = {
      id: masterFolder.id,
      name: masterFolder.name,
      type: "folder",
      size: 0,
      url: masterFolder.url,
      children: [],
      metadata: { provider: masterFolder.provider }
    };

    await this.populateFolder(
      root,
      errors,
      visitedFolderIds,
      visitedNodeIds,
      progress,
      onProgress
    );

    return {
      tree: root,
      errors,
      complete: errors.length === 0
    };
  }

  private async populateFolder(
    folderNode: TreeNode,
    errors: TraversalError[],
    visitedFolderIds: Set<string>,
    visitedNodeIds: Set<string>,
    progress: TreeBuildProgress,
    onProgress?: TreeBuildProgressListener
  ): Promise<void> {
    progress.foldersVisited += 1;
    progress.currentFolderId = folderNode.id;
    onProgress?.({ ...progress });

    let items: GoogleDriveItem[];
    try {
      items = await this.driveApi.listChildren(folderNode.id);
    } catch (error: unknown) {
      errors.push({
        kind: "folder-fetch",
        folderId: folderNode.id,
        message: getErrorMessage(error)
      });
      return;
    }

    const children = folderNode.children ?? [];
    for (const item of items) {
      if (!item.id || !item.name || !item.mimeType) {
        errors.push({
          kind: "invalid-item",
          folderId: folderNode.id,
          message: "Skipped a Drive item with incomplete metadata."
        });
        continue;
      }

      if (visitedNodeIds.has(item.id)) {
        errors.push({
          kind: "duplicate",
          folderId: folderNode.id,
          nodeId: item.id,
          message: `Skipped duplicate Drive item ${item.id}.`
        });
        continue;
      }

      visitedNodeIds.add(item.id);
      const child = toTreeNode(item);
      children.push(child);
      progress.nodesCreated += 1;
      onProgress?.({ ...progress });

      if (item.type !== "folder") {
        continue;
      }

      if (visitedFolderIds.has(item.id)) {
        errors.push({
          kind: "duplicate",
          folderId: folderNode.id,
          nodeId: item.id,
          message: `Skipped recursive Drive folder ${item.id}.`
        });
        continue;
      }

      visitedFolderIds.add(item.id);
      await this.populateFolder(
        child,
        errors,
        visitedFolderIds,
        visitedNodeIds,
        progress,
        onProgress
      );
    }

    folderNode.children = children;
    folderNode.size = children.reduce((total, child) => total + child.size, 0);
  }
}

function toTreeNode(item: GoogleDriveItem): TreeNode {
  const type = item.type;
  return {
    id: item.id,
    name: item.name,
    type,
    size: type === "shortcut" ? 0 : item.size ?? 0,
    url: item.webViewLink ?? `https://drive.google.com/open?id=${encodeURIComponent(item.id)}`,
    mimeType: item.mimeType,
    children: type === "folder" ? [] : undefined,
    metadata: {
      provider: "google-drive",
      modifiedTime: item.modifiedTime
    }
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Google Drive folder traversal failed.";
}
