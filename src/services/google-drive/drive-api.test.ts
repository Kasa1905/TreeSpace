import { GoogleDriveApi } from "./drive-api";
import type { AuthTokenProvider } from "./auth";

const auth: AuthTokenProvider = {
  getToken: vi.fn().mockResolvedValue("test-token"),
  invalidateToken: vi.fn().mockResolvedValue(undefined)
};

describe("GoogleDriveApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists folder metadata across pages", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({
        files: [{ id: "folder-1", name: "Projects", mimeType: "application/vnd.google-apps.folder" }],
        nextPageToken: "next-page"
      })))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        files: [{ id: "folder-2", name: "College", mimeType: "application/vnd.google-apps.folder" }]
      })));

    const folders = await new GoogleDriveApi(auth).listFolders("root");

    expect(folders.map((folder) => folder.id)).toEqual(["folder-1", "folder-2"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toContain("trashed+%3D+false");
  });

  it("ignores non-folder Drive items", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      files: [
        { id: "file-1", name: "Notes", mimeType: "text/plain" },
        { id: "folder-1", name: "Projects", mimeType: "application/vnd.google-apps.folder" }
      ]
    })));

    await expect(new GoogleDriveApi(auth).listFolders("root")).resolves.toHaveLength(1);
  });

  it("normalizes file sizes and shortcuts when listing children", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      files: [
        { id: "file-1", name: "Notes", mimeType: "text/plain", size: "42" },
        { id: "file-2", name: "Docs file", mimeType: "application/pdf" },
        {
          id: "shortcut-1",
          name: "Shared folder",
          mimeType: "application/vnd.google-apps.shortcut",
          shortcutDetails: { targetId: "target-folder" }
        }
      ]
    })));

    await expect(new GoogleDriveApi(auth).listChildren("root")).resolves.toEqual([
      expect.objectContaining({ id: "file-1", type: "file", size: 42 }),
      expect.objectContaining({ id: "file-2", type: "file", size: 0 }),
      expect.objectContaining({ id: "shortcut-1", type: "shortcut", shortcutTargetId: "target-folder" })
    ]);
  });
});
