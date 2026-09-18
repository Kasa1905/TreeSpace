import {
  GOOGLE_DRIVE_API_BASE_URL,
  GOOGLE_DRIVE_FOLDER_MIME_TYPE
} from "./constants";
import type { AuthTokenProvider } from "./auth";
import type { GoogleDriveFolder } from "./types";

interface DriveFileListResponse {
  files?: Array<{
    id?: string;
    name?: string;
    mimeType?: string;
    webViewLink?: string;
    parents?: string[];
  }>;
  nextPageToken?: string;
}

export class GoogleDriveApi {
  constructor(private readonly auth: AuthTokenProvider) {}

  async listFolders(parentId: string): Promise<GoogleDriveFolder[]> {
    const folders: GoogleDriveFolder[] = [];
    let pageToken: string | undefined;

    do {
      const params = new URLSearchParams({
        q: `'${escapeDriveQueryValue(parentId)}' in parents and mimeType = '${GOOGLE_DRIVE_FOLDER_MIME_TYPE}' and trashed = false`,
        fields: "nextPageToken,files(id,name,mimeType,webViewLink,parents)",
        orderBy: "name_natural",
        pageSize: "1000"
      });
      if (pageToken) {
        params.set("pageToken", pageToken);
      }

      const response = await this.request(`/files?${params.toString()}`);
      const data = (await response.json()) as DriveFileListResponse;

      for (const file of data.files ?? []) {
        if (file.id && file.name && file.mimeType === GOOGLE_DRIVE_FOLDER_MIME_TYPE) {
          folders.push({
            id: file.id,
            name: file.name,
            mimeType: GOOGLE_DRIVE_FOLDER_MIME_TYPE,
            webViewLink: file.webViewLink,
            parents: file.parents
          });
        }
      }

      pageToken = data.nextPageToken;
    } while (pageToken);

    return folders;
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

function escapeDriveQueryValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}
