# TreeSpace Architecture

## Overview

TreeSpace is a Chromium Manifest V3 extension built around a provider-independent tree model.

```text
Google Drive API
      ↓
Google Drive Adapter
      ↓
Provider-independent TreeNode model
      ↓
Tree state / application layer
      ↓
 ┌────────────┬────────────┬────────────┐
 Classic Tree │ Branch Tree │ Radial Tree │
 └────────────┴────────────┴────────────┘
```

## Extension Layers

### Background / Service Worker

Responsible for extension-level operations such as authentication coordination, API communication where appropriate, tab creation, and message handling between extension surfaces.

### UI

React + TypeScript components provide the popup, options/settings, and visualization experience.

### Provider Services

Google Drive-specific API code lives under `src/services/google-drive/`. The rest of the application should consume normalized data instead of depending directly on Drive API response shapes.

Authentication and Drive API calls are handled by the background service worker. React surfaces communicate through the TreeSpace service boundary rather than calling `chrome.identity` or the Drive REST API directly.

### Master Folder State

The selected Master Folder is a persisted provider record, separate from `TreeNode` data and transient folder-browser location:

```text
Drive account → folder browser location → explicit folder selection → Master Folder storage
```

The Master Folder is changed only by an explicit selection action. Browsing child folders or reopening the extension never replaces it.

### Tree Model

The core tree model represents files, folders, and shortcuts consistently regardless of how the source provider stores them.

```ts
interface TreeNode {
  id: string;
  name: string;
  type: "file" | "folder" | "shortcut";
  size: number;
  url: string;
  mimeType?: string;
  children?: TreeNode[];
  metadata?: {
    provider: "google-drive";
    modifiedTime?: string;
  };
}
```

The model can evolve as implementation details become clearer, but provider-specific response objects should not leak into visualization components.

## Storage Calculation

- Files use the available Drive file size when applicable.
- Folder totals are calculated recursively from descendant files.
- Shortcuts are displayed but contribute `0 B` to totals.
- A shortcut is treated as a reference rather than another copy of the target item.

Google-native files whose API representation does not expose a binary size will be handled explicitly rather than silently presenting an inaccurate value.

## Navigation

Each node retains the original Drive URL when available.

- Folder click opens the corresponding Google Drive folder.
- File click opens the corresponding Drive item.
- New-tab opening is enabled by default and controlled by a user preference.

## Visualization Contract

All three Phase 1 visualizations consume the same tree data. Switching between Classic, Branch, and Radial views must not require another Drive API traversal.

```text
Tree Data
   │
   ├── Classic Tree renderer
   ├── Branch Tree renderer
   └── Radial Tree renderer
```

This separation allows visualization work to progress independently from provider integration.

## Future Providers

Phase 5 can add provider adapters without replacing the visualization layer:

```text
Google Drive ─┐
OneDrive ──────┼──> Provider Adapter ──> TreeNode ──> Visualizations
Dropbox ───────┘
```
