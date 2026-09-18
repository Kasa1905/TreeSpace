import { GoogleDriveTreeBuilder } from "./tree-builder";
import type { GoogleDriveItem } from "./types";

const masterFolder = {
  id: "root-folder",
  name: "Projects",
  provider: "google-drive" as const,
  url: "https://drive.google.com/drive/folders/root-folder"
};

function item(overrides: Partial<GoogleDriveItem> & Pick<GoogleDriveItem, "id" | "name" | "type" | "mimeType">): GoogleDriveItem {
  return overrides;
}

describe("GoogleDriveTreeBuilder", () => {
  it("builds the Master Folder as the root and calculates nested sizes", async () => {
    const children = new Map<string, GoogleDriveItem[]>([
      ["root-folder", [
        item({ id: "backend", name: "Backend", type: "folder", mimeType: "application/vnd.google-apps.folder" }),
        item({ id: "frontend", name: "Frontend", type: "folder", mimeType: "application/vnd.google-apps.folder" }),
        item({ id: "root-file", name: "README.pdf", type: "file", mimeType: "application/pdf", size: 50 })
      ]],
      ["backend", [
        item({ id: "api", name: "API.py", type: "file", mimeType: "text/x-python", size: 500 }),
        item({ id: "nested", name: "Nested", type: "folder", mimeType: "application/vnd.google-apps.folder" })
      ]],
      ["nested", [
        item({ id: "b", name: "b.pdf", type: "file", mimeType: "application/pdf", size: 100 })
      ]],
      ["frontend", [
        item({ id: "app", name: "App.tsx", type: "file", mimeType: "text/typescript", size: 200 })
      ]]
    ]);
    const api = { listChildren: vi.fn((folderId: string) => Promise.resolve(children.get(folderId) ?? [])) };

    const result = await new GoogleDriveTreeBuilder(api).build(masterFolder);

    expect(result.complete).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.tree.id).toBe("root-folder");
    expect(result.tree.size).toBe(850);
    expect(result.tree.children?.[0]?.size).toBe(600);
    expect(result.tree.children?.[1]?.size).toBe(200);
    expect(api.listChildren).toHaveBeenCalledWith("root-folder");
  });

  it("keeps shortcuts visible at zero bytes without traversing their targets", async () => {
    const api = {
      listChildren: vi.fn((folderId: string) => Promise.resolve(folderId === "root-folder"
        ? [item({
          id: "shortcut-1",
          name: "Shared API",
          type: "shortcut",
          mimeType: "application/vnd.google-apps.shortcut",
          shortcutTargetId: "target-folder"
        })]
        : [item({ id: "secret", name: "secret.txt", type: "file", mimeType: "text/plain", size: 999 })]))
    };

    const result = await new GoogleDriveTreeBuilder(api).build(masterFolder);

    expect(result.tree.children).toEqual([
      expect.objectContaining({ id: "shortcut-1", type: "shortcut", size: 0, children: undefined })
    ]);
    expect(result.tree.size).toBe(0);
    expect(api.listChildren).toHaveBeenCalledTimes(1);
    expect(api.listChildren).not.toHaveBeenCalledWith("target-folder");
  });

  it("prevents duplicate folder relationships from causing recursion", async () => {
    const api = {
      listChildren: vi.fn((folderId: string) => Promise.resolve(folderId === "root-folder"
        ? [
          item({ id: "child", name: "Child", type: "folder", mimeType: "application/vnd.google-apps.folder" }),
          item({ id: "child", name: "Child again", type: "folder", mimeType: "application/vnd.google-apps.folder" })
        ]
        : [item({ id: "root-folder", name: "Loop", type: "folder", mimeType: "application/vnd.google-apps.folder" })]))
    };

    const result = await new GoogleDriveTreeBuilder(api).build(masterFolder);

    expect(result.complete).toBe(false);
    expect(result.errors.some((error) => error.kind === "duplicate")).toBe(true);
    expect(api.listChildren).toHaveBeenCalledTimes(2);
  });

  it("returns a partial tree and traversal error when a child folder cannot be read", async () => {
    const api = {
      listChildren: vi.fn((folderId: string) => folderId === "root-folder"
        ? Promise.resolve([item({ id: "restricted", name: "Restricted", type: "folder", mimeType: "application/vnd.google-apps.folder" })])
        : Promise.reject(new Error("Permission denied")))
    };

    const result = await new GoogleDriveTreeBuilder(api).build(masterFolder);

    expect(result.complete).toBe(false);
    expect(result.tree.children?.[0]).toEqual(expect.objectContaining({ id: "restricted", size: 0 }));
    expect(result.errors).toEqual([expect.objectContaining({ kind: "folder-fetch", folderId: "restricted", message: "Permission denied" })]);
  });
});