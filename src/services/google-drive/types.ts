export interface GoogleDriveFolder {
  id: string;
  name: string;
  mimeType: typeof import("./constants").GOOGLE_DRIVE_FOLDER_MIME_TYPE;
  webViewLink?: string;
  parents?: string[];
}

export interface MasterFolder {
  id: string;
  name: string;
  provider: "google-drive";
  url: string;
}

export interface DriveSession {
  authenticated: boolean;
}

export interface GoogleDriveService {
  getSession(): Promise<DriveSession>;
  signIn(): Promise<DriveSession>;
  listFolders(parentId: string): Promise<GoogleDriveFolder[]>;
}
