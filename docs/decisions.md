# TreeSpace Architecture Decisions

## ADR-001: Product Name

**Decision:** The project is named **TreeSpace**.

**Reason:** The name is not tied to a single cloud provider and leaves room for future providers and storage-focused features.

## ADR-002: Provider-independent Tree Model

**Decision:** Visualizations consume a normalized tree model rather than Google Drive API objects directly.

**Reason:** This keeps the UI independent from the first storage provider and makes Phase 5 provider expansion practical.

## ADR-003: Three Initial Visualizations

**Decision:** Phase 1 includes Classic Tree, Branch Tree, and Radial Tree.

**Reason:** They provide distinct DSA-style representations while sharing the same underlying hierarchy.

## ADR-004: Shortcuts Are Visible but Zero-size

**Decision:** Google Drive shortcuts appear as nodes but contribute `0 B` to folder storage totals.

**Reason:** A shortcut is a reference to another Drive item, not an additional stored copy of that item in the selected hierarchy.

## ADR-005: New-tab Navigation by Default

**Decision:** Opening Drive items in a new browser tab is enabled by default and can be disabled in settings.

**Reason:** The visualization remains available while users inspect multiple Drive items.

## ADR-006: API-first Integration

**Decision:** TreeSpace will use the Google Drive API rather than scraping the Google Drive web interface.

**Reason:** API-based access is more stable and keeps provider logic separated from the Drive website's implementation details.

## ADR-007: Phase-based Development

**Decision:** Development follows the roadmap from Phase 1 through Phase 5.

**Reason:** Core architecture should be validated before adding storage intelligence, advanced UX, exports, and additional providers.

## ADR-008: Chrome Identity OAuth and Metadata-only Drive Access

**Decision:** TreeSpace uses `chrome.identity.getAuthToken()` with the Google Drive scope `https://www.googleapis.com/auth/drive.metadata.readonly`. The OAuth client ID is supplied as `TREESPACE_GOOGLE_CLIENT_ID` at build time and is not committed.

**Reason:** The Chrome Identity API is the platform-supported MV3 flow for Google OAuth. Metadata-only access is sufficient for listing accessible folders and avoids write, delete, download, and file-content permissions in this issue.

## ADR-009: Fixed Master Folder

**Decision:** The Master Folder is persisted separately from Drive browsing state and changes only through an explicit TreeSpace folder-selection action.

**Reason:** The selected folder is the future visualization root. Drive navigation must never implicitly rebuild or replace that root.

## ADR-010: Runtime Tree and View State Separation

**Decision:** `TreeSpaceRuntime` owns an in-memory `TreeDataState` snapshot and a separate `TreeViewState`. It loads and refreshes from the existing `MasterFolderStore` and recursive builder; it does not persist the tree or perform Drive REST operations directly.

**Reason:** Future visualizations must share one tree snapshot while independently changing visualization mode, expansion, and current-folder state without refetching or mutating provider-independent data.

## ADR-011: Classic Tree Uses Runtime-Owned Expansion

**Decision:** The Classic Tree renders the shared runtime `TreeNode` snapshot and delegates folder expansion to `TreeSpaceRuntime.setExpanded`. It does not maintain a separate recursive data copy or expansion state.

**Reason:** This keeps manual view interaction separate from provider-independent data and allows later visualizations to consume the same snapshot and view state.
