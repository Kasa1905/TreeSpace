import type { TreeNode } from "./tree-node";

describe("TreeNode", () => {
  it("supports normalized file, folder, and shortcut data", () => {
    const nodes: TreeNode[] = [
      { id: "file-1", name: "Notes", type: "file", size: 42, url: "https://drive.google.com/file/file-1" },
      { id: "folder-1", name: "Projects", type: "folder", size: 42, url: "https://drive.google.com/drive/folders/folder-1", children: [] },
      { id: "shortcut-1", name: "Alias", type: "shortcut", size: 0, url: "https://drive.google.com/file/shortcut-1" }
    ];

    expect(nodes.map((node) => node.type)).toEqual(["file", "folder", "shortcut"]);
  });
});
