import { fireEvent, render, screen } from "@testing-library/react";
import type { TreeNode } from "../../models/tree-node";
import type { TreeViewState } from "../../types/tree-runtime";
import { ClassicTree } from "./ClassicTree";

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
  visualizationMode: "classic",
  expandedNodeIds: new Set(["root", "backend"])
};

describe("ClassicTree", () => {
  it("renders the root, nested folders, files, shortcuts, and sizes", () => {
    render(<ClassicTree tree={tree} viewState={expandedView} onToggle={vi.fn()} />);

    expect(screen.getByText("Projects")).toBeTruthy();
    expect(screen.getByText("Backend")).toBeTruthy();
    expect(screen.getByText("API.py")).toBeTruthy();
    expect(screen.getByText("Shared Project")).toBeTruthy();
    expect(screen.getByText("Shortcut")).toBeTruthy();
    expect(screen.getByText("2 MB")).toBeTruthy();
    expect(screen.getByText("512 KB")).toBeTruthy();
    expect(screen.getByText("42 B")).toBeTruthy();
  });

  it("renders empty folders without implying a load failure", () => {
    render(
      <ClassicTree
        tree={tree}
        viewState={{ ...expandedView, expandedNodeIds: new Set(["root", "backend", "empty"]) }}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText("Empty folder")).toBeTruthy();
    expect(screen.getAllByText("0 B").length).toBeGreaterThan(0);
  });

  it("uses the runtime callback for folder expansion without mutating TreeNode", () => {
    const onToggle = vi.fn();
    const originalChildren = tree.children;
    render(<ClassicTree tree={tree} viewState={expandedView} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("button", { name: "Collapse Backend" }));

    expect(onToggle).toHaveBeenCalledWith("backend");
    expect(tree.children).toBe(originalChildren);
    expect(tree.children?.[0]?.children?.[0]?.name).toBe("API.py");
  });

  it("opens a file using its stored URL", () => {
    const onOpen = vi.fn();
    render(<ClassicTree tree={tree} viewState={expandedView} onToggle={vi.fn()} onOpen={onOpen} />);

    fireEvent.click(screen.getByRole("button", { name: /API\.py/ }));

    expect(onOpen).toHaveBeenCalledWith(tree.children?.[0]?.children?.[0]);
  });
});
