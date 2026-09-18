import { fireEvent, render, screen } from "@testing-library/react";
import type { TreeNode } from "../../models/tree-node";
import type { TreeViewState } from "../../types/tree-runtime";
import { BranchTree } from "./BranchTree";

const tree: TreeNode = {
  id: "root",
  name: "Projects",
  type: "folder",
  size: 1024 * 1024 * 2,
  url: "https://drive.google.com/drive/folders/root",
  children: [
    {
      id: "backend",
      name: "Backend",
      type: "folder",
      size: 1024 * 512,
      url: "https://drive.google.com/drive/folders/backend",
      children: [
        {
          id: "api",
          name: "API.py",
          type: "file",
          size: 42,
          url: "https://drive.google.com/file/api",
          mimeType: "text/x-python"
        }
      ]
    },
    {
      id: "empty",
      name: "Empty Folder",
      type: "folder",
      size: 0,
      url: "https://drive.google.com/drive/folders/empty",
      children: []
    },
    {
      id: "shortcut",
      name: "Shared Project",
      type: "shortcut",
      size: 0,
      url: "https://drive.google.com/file/shortcut",
      mimeType: "application/vnd.google-apps.shortcut"
    }
  ]
};

const expandedView: TreeViewState = {
  visualizationMode: "branch",
  expandedNodeIds: new Set(["root", "backend", "empty"])
};

describe("BranchTree", () => {
  it("renders the root, nested hierarchy, connections, node types, and sizes", () => {
    render(<BranchTree tree={tree} viewState={expandedView} onToggle={vi.fn()} />);

    expect(screen.getByRole("region", { name: "Branch Tree visualization" })).toBeTruthy();
    expect(screen.getByText("Projects")).toBeTruthy();
    expect(screen.getByText("Backend")).toBeTruthy();
    expect(screen.getByText("API.py")).toBeTruthy();
    expect(screen.getByText("Shared Project")).toBeTruthy();
    expect(screen.getByText("Shortcut")).toBeTruthy();
    expect(screen.getByText("Empty folder")).toBeTruthy();
    expect(screen.getByText("2 MB")).toBeTruthy();
    expect(screen.getByText("512 KB")).toBeTruthy();
    expect(screen.getByText("42 B")).toBeTruthy();
    expect(document.querySelector(".branch-tree__children")).toBeTruthy();
    expect(document.querySelector(".branch-tree__children > .branch-tree__branch")).toBeTruthy();
  });

  it("hides descendants when a folder is collapsed", () => {
    render(<BranchTree tree={tree} viewState={{ ...expandedView, expandedNodeIds: new Set(["root"]) }} onToggle={vi.fn()} />);

    expect(screen.getByText("Backend")).toBeTruthy();
    expect(screen.queryByText("API.py")).toBeNull();
    expect(screen.queryByText("Empty folder")).toBeNull();
  });

  it("delegates folder expansion and does not mutate TreeNode", () => {
    const onToggle = vi.fn();
    const originalChildren = tree.children;
    render(<BranchTree tree={tree} viewState={expandedView} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("button", { name: "Collapse Backend" }));

    expect(onToggle).toHaveBeenCalledWith("backend");
    expect(tree.children).toBe(originalChildren);
  });

  it("opens file and shortcut nodes through their stored URLs", () => {
    const onOpen = vi.fn();
    render(<BranchTree tree={tree} viewState={expandedView} onToggle={vi.fn()} onOpen={onOpen} />);

    fireEvent.click(screen.getByRole("button", { name: "Open API.py" }));
    fireEvent.click(screen.getByRole("button", { name: "Open Shared Project" }));

    expect(onOpen).toHaveBeenNthCalledWith(1, tree.children?.[0]?.children?.[0]);
    expect(onOpen).toHaveBeenNthCalledWith(2, tree.children?.[2]);
  });
});
