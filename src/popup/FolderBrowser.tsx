import { useEffect, useState } from "react";
import { listFolders } from "../services/extension-api";
import type { GoogleDriveFolder } from "../services/google-drive/types";

const DRIVE_ROOT_ID = "root";

interface FolderLocation {
  id: string;
  name: string;
}

interface FolderBrowserProps {
  onSelect: (folder: GoogleDriveFolder) => Promise<void>;
}

export function FolderBrowser({ onSelect }: FolderBrowserProps) {
  const [locations, setLocations] = useState<FolderLocation[]>([
    { id: DRIVE_ROOT_ID, name: "My Drive" }
  ]);
  const [folders, setFolders] = useState<GoogleDriveFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState<string>();
  const [error, setError] = useState<string>();

  const currentLocation = locations[locations.length - 1];

  useEffect(() => {
    void loadFolders(currentLocation.id);
  }, [currentLocation.id]);

  async function loadFolders(parentId: string) {
    setLoading(true);
    setError(undefined);
    try {
      setFolders(await listFolders(parentId));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not load Drive folders.");
    } finally {
      setLoading(false);
    }
  }

  function openFolder(folder: GoogleDriveFolder) {
    setLocations((current) => [...current, { id: folder.id, name: folder.name }]);
  }

  function goToParent() {
    setLocations((current) => (current.length > 1 ? current.slice(0, -1) : current));
  }

  async function selectFolder(folder: GoogleDriveFolder) {
    setSelectingId(folder.id);
    setError(undefined);
    try {
      await onSelect(folder);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not select this folder.");
    } finally {
      setSelectingId(undefined);
    }
  }

  return (
    <section className="folder-browser" aria-label="Choose Master Folder">
      <div className="folder-browser__toolbar">
        <div>
          <p className="foundation-page__eyebrow">Choose Master Folder</p>
          <h2>{currentLocation.name}</h2>
        </div>
        <button type="button" onClick={goToParent} disabled={locations.length === 1}>
          Back
        </button>
      </div>

      {loading && <p>Loading folders...</p>}
      {!loading && !error && folders.length === 0 && <p>No accessible folders here.</p>}
      {error && <p className="folder-browser__error" role="alert">{error}</p>}
      {!loading && !error && folders.length > 0 && (
        <ul className="folder-browser__list">
          {folders.map((folder) => (
            <li key={folder.id} className="folder-browser__item">
              <button type="button" className="folder-browser__open" onClick={() => openFolder(folder)}>
                <span aria-hidden="true">Folder</span>
                {folder.name}
              </button>
              <button
                type="button"
                className="folder-browser__select"
                onClick={() => void selectFolder(folder)}
                disabled={selectingId !== undefined}
              >
                {selectingId === folder.id ? "Saving..." : "Select"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
