import { fireEvent, render, screen } from "@testing-library/react";
import type { TreeNode } from "../../models/tree-node";
import type { TreeViewState } from "../../types/tree-runtime";
import { RadialTree } from "./RadialTree";
import { calculateRadialLayout } from "./radial-layout";

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
  visualizationMode: "radial",
  expandedNodeIds: new Set(["root", "backend", "empty"])
};

describe("calculateRadialLayout", () => {
  it("places the root at center and descendants on deterministic depth rings", () => {
    const layout = calculateRadialLayout(tree, expandedView.expandedNodeIds);
    const root = layout.points.find((point) => point.node.id === "root");
    const backend = layout.points.find((point) => point.node.id === "backend");
    const api = layout.points.find((point) => point.node.id === "api");

    expect(root).toMatchObject({ x: layout.center, y: layout.center, depth: 0 });
    expect(backend?.depth).toBe(1);
    expect(api?.depth).toBe(2);
    expect(Math.hypot((backend?.x ?? 0) - layout.center, (backend?.y ?? 0) - layout.center)).toBeCloseTo(105);
    expect(Math.hypot((api?.x ?? 0) - layout.center, (api?.y ?? 0) - layout.center)).toBeCloseTo(210);
    expect(backend?.parentId).toBe("root");
    expect(api?.parentId).toBe("backend");
  });

  it("removes collapsed descendants from the visible layout without changing the source tree", () => {
    const originalChildren = tree.children;
    const layout = calculateRadialLayout(tree, new Set(["root"]));

    expect(layout.points.map((point) => point.node.id)).toEqual(["root", "backend", "empty", "shortcut"]);
    expect(tree.children).toBe(originalChildren);
    expect(tree.children?.[0]?.children?.[0]?.name).toBe("API.py");
  });
});

describe("RadialTree", () => {
  it("renders nodes, connections, sizes, shortcuts, and empty folders", () => {
    render(<RadialTree tree={tree} viewState={expandedView} onToggle={vi.fn()} />);

    expect(screen.getByRole("region", { name: "Radial Tree visualization" })).toBeTruthy();
    expect(screen.getByText("Projects")).toBeTruthy();
    expect(screen.getByText("Backend")).toBeTruthy();
    expect(screen.getByText("API.py")).toBeTruthy();
    expect(screen.getByText("Shared Project")).toBeTruthy();
    expect(screen.getByText("Shortcut")).toBeTruthy();
    expect(screen.getByText("Empty Folder")).toBeTruthy();
    expect(screen.getByText("2 MB")).toBeTruthy();
    expect(screen.getByText("512 KB")).toBeTruthy();
    expect(screen.getByText("42 B")).toBeTruthy();
    expect(document.querySelectorAll(".radial-tree__connections line").length).toBe(4);
  });

  it("hides descendants and connections when a folder is collapsed", () => {
    render(<RadialTree tree={tree} viewState={{ ...expandedView, expandedNodeIds: new Set(["root"]) }} onToggle={vi.fn()} />);

    expect(screen.getByText("Backend")).toBeTruthy();
    expect(screen.queryByText("API.py")).toBeNull();
    expect(document.querySelectorAll(".radial-tree__connections line").length).toBe(3);
  });

  it("delegates folder toggles and file/shortcut activation", () => {
    const onToggle = vi.fn();
    const onOpen = vi.fn();
    render(<RadialTree tree={tree} viewState={expandedView} onToggle={onToggle} onOpen={onOpen} />);

    fireEvent.click(screen.getByRole("button", { name: "Collapse Backend" }));
    fireEvent.click(screen.getByRole("button", { name: "Open API.py" }));
    fireEvent.click(screen.getByRole("button", { name: "Open Shared Project" }));

    expect(onToggle).toHaveBeenCalledWith("backend");
    expect(onOpen).toHaveBeenNthCalledWith(1, tree.children?.[0]?.children?.[0]);
    expect(onOpen).toHaveBeenNthCalledWith(2, tree.children?.[2]);
  });
});
