# Google Drive API Notes

This document records integration requirements for the Google Drive provider. Exact API behavior and OAuth configuration should be verified against the current Google documentation before implementation.

## Intended Operations

TreeSpace needs to:

- authenticate the user with Google;
- identify/read a selected folder;
- list files and folders recursively;
- read file metadata such as name, MIME type, size, modification time, and Drive URL where available;
- identify Google Drive shortcuts;
- read shortcut target metadata when needed for navigation.

## Data Normalization

Drive API responses should be converted into the TreeSpace `TreeNode` model inside the Google Drive adapter. Visualization components should not depend directly on Drive API response types.

## Recursive Traversal

Folder traversal must handle pagination. A folder should be considered complete only after all pages of its children have been processed.

Conceptually:

```text
selected folder
      ↓
list children
      ↓
for each child:
  file      → normalize node
  folder    → recursively list children
  shortcut  → normalize as shortcut, do not recurse into target
      ↓
calculate folder total
```

## Size Handling

Binary files can expose a byte size through Drive metadata. Google-native Workspace files may not expose a conventional binary file size in the same way. TreeSpace must represent this distinction explicitly rather than assuming an absent value means a real `0 B` file.

Folder totals should sum the sizes of descendant files that have a meaningful byte size. Shortcuts always contribute `0 B`.

## Navigation

Prefer the Drive-provided web view URL when available for opening an item. URL construction should not be duplicated throughout the UI.

## Permissions

Use the narrowest practical OAuth scope. Phase 1 is read-oriented, so write access should not be requested unless a later feature genuinely requires it.

## Shared Drives

Shared Drive support is planned for Phase 4. The initial provider implementation should avoid making assumptions that would prevent later support for shared-drive files and folders.
