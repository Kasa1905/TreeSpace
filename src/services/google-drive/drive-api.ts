import {
  GOOGLE_DRIVE_API_BASE_URL,
  GOOGLE_DRIVE_FOLDER_MIME_TYPE,
  GOOGLE_DRIVE_SHORTCUT_MIME_TYPE
} from "./constants";
import type { AuthTokenProvider } from "./auth";
import type { GoogleDriveFolder, GoogleDriveItem } from "./types";

interface DriveFileListResponse {
  files?: Array<{
    id?: string;
    name?: string;
    mimeType?: string;
    size?: string;
    webViewLink?: string;
    modifiedTime?: string;
    parents?: string[];
    shortcutDetails?: {
      targetId?: string;
    };
  }>;
  nextPageToken?: string;
}

export class GoogleDriveApi {
  constructor(private readonly auth: AuthTokenProvider) {}

  async listFolders(parentId: string): Promise<GoogleDriveFolder[]> {
    const items = await this.listChildren(parentId);
    return items
      .filter((item) => item.type === "folder")
      .map((item) => ({
        id: item.id,
        name: item.name,
        mimeType: GOOGLE_DRIVE_FOLDER_MIME_TYPE,
        webViewLink: item.webViewLink,
        parents: item.parents
      }));
  }

  async listChildren(parentId: string): Promise<GoogleDriveItem[]> {
    const items: GoogleDriveItem[] = [];
    let pageToken: string | undefined;

    do {
      const params = new URLSearchParams({
        q: `'${escapeDriveQueryValue(parentId)}' in parents and trashed = false`,
        fields: "nextPageToken,files(id,name,mimeType,size,webViewLink,modifiedTime,parents,shortcutDetails(targetId))",
        orderBy: "name_natural",
        pageSize: "1000"
      });
      if (pageToken) {
        params.set("pageToken", pageToken);
      }

      const response = await this.request(`/files?${params.toString()}`);
      const data = (await response.json()) as DriveFileListResponse;

      for (const file of data.files ?? []) {
        if (!file.id || !file.name || !file.mimeType) {
          continue;
        }

        items.push({
          id: file.id,
          name: file.name,
          type: getItemType(file.mimeType),
          mimeType: file.mimeType,
          size: parseSize(file.size),
          webViewLink: file.webViewLink,
          modifiedTime: file.modifiedTime,
          parents: file.parents,
          shortcutTargetId: file.shortcutDetails?.targetId
        });
      }

      pageToken = data.nextPageToken;
    } while (pageToken);

    return items;
  }

  private async request(path: string): Promise<Response> {
    let token = await this.auth.getToken(false);
    let response = await fetch(`${GOOGLE_DRIVE_API_BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 401) {
      await this.auth.invalidateToken(token);
      token = await this.auth.getToken(false);
      response = await fetch(`${GOOGLE_DRIVE_API_BASE_URL}${path}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    if (!response.ok) {
      throw new Error(`Google Drive API request failed (${response.status}).`);
    }

    return response;
  }
}

function getItemType(mimeType: string): GoogleDriveItem["type"] {
  if (mimeType === GOOGLE_DRIVE_FOLDER_MIME_TYPE) {
    return "folder";
  }
  if (mimeType === GOOGLE_DRIVE_SHORTCUT_MIME_TYPE) {
    return "shortcut";
  }
  return "file";
}

function parseSize(size: string | undefined): number {
  if (!size) {
    return 0;
  }

  const parsed = Number(size);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function escapeDriveQueryValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}
