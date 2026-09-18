import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { FoundationPage } from "../components/common/FoundationPage";
import { ClassicTree } from "../components/tree/ClassicTree";
import { BranchTree } from "../components/branch/BranchTree";
import { FolderBrowser } from "./FolderBrowser";
import { buildTree, getMasterFolder, getSession, setMasterFolder, signIn } from "../services/extension-api";
import type { GoogleDriveFolder, MasterFolder } from "../services/google-drive/types";
import { chromeStorage, MasterFolderStore } from "../services/storage/master-folder-store";
import { TreeSpaceRuntime } from "../services/tree-space-runtime";
import type { TreeRuntimeState } from "../types/tree-runtime";

const runtime = new TreeSpaceRuntime(
  new MasterFolderStore(chromeStorage),
  { build: () => buildTree() }
);

function Popup() {
  const [masterFolder, setMasterFolderState] = useState<MasterFolder>();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState<string>();
  const [runtimeState, setRuntimeState] = useState<TreeRuntimeState>(runtime.getState());

  useEffect(() => {
    const unsubscribe = runtime.subscribe(setRuntimeState);
    void loadState();
    return unsubscribe;
  }, []);

  async function loadState() {
    setLoading(true);
    setError(undefined);
    try {
      const [session, savedFolder] = await Promise.all([getSession(), getMasterFolder()]);
      setAuthenticated(session.authenticated);
      setMasterFolderState(savedFolder);
      if (savedFolder) {
        await runtime.loadTree();
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not load TreeSpace.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn() {
    setLoading(true);
    setError(undefined);
    try {
      const session = await signIn();
      setAuthenticated(session.authenticated);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(folder: GoogleDriveFolder) {
    const selected: MasterFolder = {
      id: folder.id,
      name: folder.name,
      provider: "google-drive",
      url: folder.webViewLink ?? `https://drive.google.com/drive/folders/${folder.id}`
    };
    await setMasterFolder(selected);
    setMasterFolderState(selected);
    setChanging(false);
    await runtime.loadTree();
  }

  return (
    <FoundationPage surface="popup">
      {loading && <p>Loading TreeSpace...</p>}
      {!loading && error && <p className="folder-browser__error" role="alert">{error}</p>}
      {!loading && !error && !authenticated && (
        <>
          <p>Sign in to browse your accessible Google Drive folders.</p>
          <button type="button" className="foundation-page__action" onClick={() => void handleSignIn()}>
            Sign in with Google
          </button>
        </>
      )}
      {!loading && !error && authenticated && masterFolder && !changing && (
        <section>
          <p className="foundation-page__eyebrow">Master Folder</p>
          <p className="master-folder"><span aria-hidden="true">Folder</span> {masterFolder.name}</p>
          <p className="foundation-page__note">This folder remains the fixed TreeSpace root until you explicitly change it.</p>
          <button type="button" className="foundation-page__action" onClick={() => setChanging(true)}>
            Change Master Folder
          </button>
          {runtimeState.treeData.tree && (
            <div className="visualization-switcher" aria-label="Visualization mode">
              <span className="visualization-switcher__label">View</span>
              <button
                type="button"
                className={runtimeState.viewState.visualizationMode === "classic" ? "is-active" : ""}
                onClick={() => runtime.setVisualizationMode("classic")}
              >
                Classic
              </button>
              <button
                type="button"
                className={runtimeState.viewState.visualizationMode === "branch" ? "is-active" : ""}
                onClick={() => runtime.setVisualizationMode("branch")}
              >
                Branch
              </button>
            </div>
          )}
          {runtimeState.treeData.status === "loading" && <p>Loading tree...</p>}
          {runtimeState.treeData.status === "error" && (
            <p className="folder-browser__error" role="alert">
              {runtimeState.treeData.error ?? "The tree could not be loaded."}
            </p>
          )}
          {runtimeState.treeData.tree && runtimeState.viewState.visualizationMode === "classic" && (
            <ClassicTree
              tree={runtimeState.treeData.tree}
              viewState={runtimeState.viewState}
              onToggle={(nodeId) => runtime.setExpanded(
                nodeId,
                !runtimeState.viewState.expandedNodeIds.has(nodeId)
              )}
            />
          )}
          {runtimeState.treeData.tree && runtimeState.viewState.visualizationMode === "branch" && (
            <BranchTree
              tree={runtimeState.treeData.tree}
              viewState={runtimeState.viewState}
              onToggle={(nodeId) => runtime.setExpanded(
                nodeId,
                !runtimeState.viewState.expandedNodeIds.has(nodeId)
              )}
            />
          )}
        </section>
      )}
      {!loading && !error && authenticated && (!masterFolder || changing) && (
        <FolderBrowser onSelect={handleSelect} />
      )}
    </FoundationPage>
  );
}

createRoot(document.getElementById("root")!).render(<Popup />);
