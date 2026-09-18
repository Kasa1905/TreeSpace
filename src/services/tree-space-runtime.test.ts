import type { TreeNode } from "../models/tree-node";
import type { MasterFolder } from "./google-drive/types";
import type { TreeBuildResult } from "./google-drive/tree-builder";
import { TreeSpaceRuntime } from "./tree-space-runtime";

const masterFolder: MasterFolder = {
  id: "master-folder",
  name: "Projects",
  provider: "google-drive",
  url: "https://drive.google.com/drive/folders/master-folder"
};

const tree: TreeNode = {
  id: masterFolder.id,
  name: masterFolder.name,
  type: "folder",
  size: 42,
  url: masterFolder.url,
  children: []
};

class FakeMasterFolderStore {
  constructor(private readonly folder?: MasterFolder) {}

  get = vi.fn(async () => this.folder);
}

function successfulBuild(): TreeBuildResult {
  return { tree, errors: [], complete: true };
}

describe("TreeSpaceRuntime", () => {
  it("reports that a Master Folder is required when none is persisted", async () => {
    const builder = { build: vi.fn() };
    const runtime = new TreeSpaceRuntime(new FakeMasterFolderStore(), builder);

    const state = await runtime.loadTree();

    expect(state.treeData).toEqual({
      tree: null,
      status: "needs-master-folder",
      traversalErrors: []
    });
    expect(builder.build).not.toHaveBeenCalled();
  });

  it("publishes loading and ready states for a persisted Master Folder", async () => {
    let resolveBuild!: (result: TreeBuildResult) => void;
    const build = vi.fn(() => new Promise<TreeBuildResult>((resolve) => {
      resolveBuild = resolve;
    }));
    const runtime = new TreeSpaceRuntime(new FakeMasterFolderStore(masterFolder), { build });
    const statuses: string[] = [];
    runtime.subscribe((state) => statuses.push(state.treeData.status));

    const load = runtime.loadTree();
    expect(runtime.getState().treeData.status).toBe("loading");

    await Promise.resolve();
    resolveBuild(successfulBuild());
    const state = await load;

    expect(state.treeData.status).toBe("ready");
    expect(state.treeData.tree).toBe(tree);
    expect(statuses).toEqual(["loading", "ready"]);
    expect(build).toHaveBeenCalledWith(masterFolder);
  });

  it("exposes thrown builder failures as an error state", async () => {
    const runtime = new TreeSpaceRuntime(
      new FakeMasterFolderStore(masterFolder),
      { build: vi.fn().mockRejectedValue(new Error("Drive unavailable")) }
    );

    const state = await runtime.loadTree();

    expect(state.treeData).toEqual({
      tree: null,
      status: "error",
      error: "Drive unavailable",
      traversalErrors: []
    });
  });

  it("retains a partial tree and traversal errors", async () => {
    const partial = { tree, errors: [{ kind: "folder-fetch" as const, message: "Denied" }], complete: false };
    const runtime = new TreeSpaceRuntime(
      new FakeMasterFolderStore(masterFolder),
      { build: vi.fn().mockResolvedValue(partial) }
    );

    const state = await runtime.loadTree();

    expect(state.treeData.status).toBe("error");
    expect(state.treeData.tree).toBe(tree);
    expect(state.treeData.traversalErrors).toEqual(partial.errors);
  });

  it("refreshes from the same persisted Master Folder", async () => {
    const build = vi.fn().mockResolvedValue(successfulBuild());
    const store = new FakeMasterFolderStore(masterFolder);
    const runtime = new TreeSpaceRuntime(store, { build });

    await runtime.loadTree();
    await runtime.refresh();

    expect(store.get).toHaveBeenCalledTimes(2);
    expect(build).toHaveBeenNthCalledWith(1, masterFolder);
    expect(build).toHaveBeenNthCalledWith(2, masterFolder);
  });

  it("changes view state without changing tree data", async () => {
    const runtime = new TreeSpaceRuntime(
      new FakeMasterFolderStore(masterFolder),
      { build: vi.fn().mockResolvedValue(successfulBuild()) }
    );
    await runtime.loadTree();
    const treeBeforeViewChanges = runtime.getState().treeData.tree;

    runtime.setVisualizationMode("radial");
    runtime.setExpanded("child-folder", true);
    runtime.setCurrentFolder("child-folder");

    expect(runtime.getState().treeData.tree).toBe(treeBeforeViewChanges);
    expect(runtime.getState().viewState).toMatchObject({
      visualizationMode: "radial",
      currentFolderId: "child-folder"
    });
    expect(runtime.getState().viewState.expandedNodeIds).toEqual(new Set(["child-folder"]));
  });

  it("keeps current folder and expansion state independent from the Master Folder", async () => {
    const runtime = new TreeSpaceRuntime(
      new FakeMasterFolderStore(masterFolder),
      { build: vi.fn().mockResolvedValue(successfulBuild()) }
    );
    await runtime.loadTree();

    runtime.setCurrentFolder("another-folder");
    runtime.setExpanded(masterFolder.id, true);

    expect(runtime.getState().viewState.currentFolderId).toBe("another-folder");
    expect(runtime.getState().viewState.expandedNodeIds.has(masterFolder.id)).toBe(true);
    expect(masterFolder.id).toBe("master-folder");
  });
});
