import type { MasterFolder } from "./google-drive/types";
import type { MasterFolderStore } from "./storage/master-folder-store";
import type {
  TreeBuilder,
  TreeDataState,
  TreeRuntimeState,
  VisualizationMode
} from "../types/tree-runtime";

export type TreeRuntimeListener = (state: TreeRuntimeState) => void;

const initialTreeData: TreeDataState = {
  tree: null,
  status: "idle",
  traversalErrors: []
};

const initialViewState = {
  visualizationMode: "classic" as VisualizationMode,
  expandedNodeIds: new Set<string>(),
  currentFolderId: undefined
};

export class TreeSpaceRuntime {
  private state: TreeRuntimeState = {
    treeData: initialTreeData,
    viewState: initialViewState
  };

  private readonly listeners = new Set<TreeRuntimeListener>();

  constructor(
    private readonly masterFolderStore: Pick<MasterFolderStore, "get">,
    private readonly treeBuilder: TreeBuilder
  ) {}

  getState(): TreeRuntimeState {
    return this.state;
  }

  subscribe(listener: TreeRuntimeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async loadTree(): Promise<TreeRuntimeState> {
    this.update({
      treeData: {
        ...this.state.treeData,
        status: "loading",
        error: undefined,
        traversalErrors: []
      }
    });

    const masterFolder = await this.masterFolderStore.get();
    if (!masterFolder) {
      return this.update({
        treeData: {
          tree: null,
          status: "needs-master-folder",
          traversalErrors: []
        }
      });
    }

    return this.buildTree(masterFolder);
  }

  refresh(): Promise<TreeRuntimeState> {
    return this.loadTree();
  }

  setVisualizationMode(visualizationMode: VisualizationMode): TreeRuntimeState {
    return this.update({
      viewState: {
        ...this.state.viewState,
        visualizationMode
      }
    });
  }

  setExpanded(nodeId: string, expanded: boolean): TreeRuntimeState {
    const expandedNodeIds = new Set(this.state.viewState.expandedNodeIds);
    if (expanded) {
      expandedNodeIds.add(nodeId);
    } else {
      expandedNodeIds.delete(nodeId);
    }

    return this.update({
      viewState: {
        ...this.state.viewState,
        expandedNodeIds
      }
    });
  }

  setCurrentFolder(folderId: string | undefined): TreeRuntimeState {
    return this.update({
      viewState: {
        ...this.state.viewState,
        currentFolderId: folderId
      }
    });
  }

  private async buildTree(masterFolder: MasterFolder): Promise<TreeRuntimeState> {
    try {
      const result = await this.treeBuilder.build(masterFolder);
      if (!result.complete) {
        return this.update({
          treeData: {
            tree: result.tree,
            status: "error",
            error: "TreeSpace loaded a partial tree with traversal errors.",
            traversalErrors: result.errors
          },
          viewState: this.getInitialViewState(result.tree.id)
        });
      }

      return this.update({
        treeData: {
          tree: result.tree,
          status: "ready",
          traversalErrors: []
        },
        viewState: this.getInitialViewState(result.tree.id)
      });
    } catch (error: unknown) {
      return this.update({
        treeData: {
          tree: this.state.treeData.tree,
          status: "error",
          error: getErrorMessage(error),
          traversalErrors: []
        }
      });
    }
  }

  private getInitialViewState(rootId: string): TreeRuntimeState["viewState"] {
    if (this.state.viewState.expandedNodeIds.size > 0) {
      return this.state.viewState;
    }

    return {
      ...this.state.viewState,
      expandedNodeIds: new Set([rootId])
    };
  }

  private update(change: Partial<TreeRuntimeState>): TreeRuntimeState {
    this.state = {
      ...this.state,
      ...change
    };
    for (const listener of this.listeners) {
      listener(this.state);
    }
    return this.state;
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "TreeSpace could not load the tree.";
}
