import type { TreeNode } from "../models/tree-node";
import type { TraversalError, TreeBuildResult } from "../services/google-drive/tree-builder";
import type { MasterFolder } from "../services/google-drive/types";

export type TreeDataStatus = "idle" | "needs-master-folder" | "loading" | "ready" | "error";

export interface TreeDataState {
  tree: TreeNode | null;
  status: TreeDataStatus;
  error?: string;
  traversalErrors: TraversalError[];
}

export type VisualizationMode = "classic" | "branch" | "radial";

export interface TreeViewState {
  visualizationMode: VisualizationMode;
  expandedNodeIds: ReadonlySet<string>;
  currentFolderId?: string;
}

export interface TreeRuntimeState {
  treeData: TreeDataState;
  viewState: TreeViewState;
}

export type TreeBuilder = {
  build(masterFolder: MasterFolder): Promise<TreeBuildResult>;
};
