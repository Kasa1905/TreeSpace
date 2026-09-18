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
    expect(fetchMock.mock.calls[0]?.[0]).toContain("mimeType+%3D+%27application%2Fvnd.google-apps.folder%27");
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
});
