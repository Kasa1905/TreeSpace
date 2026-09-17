# TreeSpace

> Visualize Google Drive folders as DSA-style trees.

TreeSpace is a Chromium browser extension that turns a Google Drive folder into an interactive visual tree. Instead of navigating a folder only as a list, TreeSpace represents the folder hierarchy as a data structure that can be explored visually.

## Project Status

**Current phase:** Phase 1 — Core MVP  
**Status:** Foundation setup

## Core Experience

1. Choose a Google Drive folder.
2. TreeSpace recursively reads the folder hierarchy.
3. File and folder sizes are calculated and displayed.
4. Google Drive shortcuts remain visible but contribute `0 B` to storage totals.
5. Choose one of three visualizations:
   - Classic Tree
   - Branch Tree
   - Radial Tree
6. Click a folder to open it in Google Drive.
7. Click a file to open the original Drive item.
8. File opening uses a new browser tab by default and can be disabled in settings.

## Architecture

```text
Google Drive API
       ↓
  Drive Adapter
       ↓
Provider-independent
   Tree Model
       ↓
 ┌──────────┬──────────┬──────────┐
 Classic    Branch      Radial
  Tree       Tree        Tree
```

The visualization layer is intentionally independent from Google Drive so future providers such as OneDrive or Dropbox can reuse the same tree model.

## Roadmap

### Phase 1 — Core MVP

- [ ] Chromium Manifest V3 extension foundation
- [ ] Google authentication
- [ ] Google Drive folder selection
- [ ] Recursive Drive traversal
- [ ] Provider-independent tree data model
- [ ] File size calculation
- [ ] Recursive folder size calculation
- [ ] Shortcut detection and zero-size handling
- [ ] Classic Tree visualization
- [ ] Branch Tree visualization
- [ ] Radial Tree visualization
- [ ] Visualization switching without refetching Drive data
- [ ] File/folder click handling
- [ ] New-tab behavior, enabled by default
- [ ] New-tab preference setting
- [ ] Loading, progress, and error states

### Phase 2 — Navigation & Usability

- [ ] Search
- [ ] Expand All / Collapse All
- [ ] Breadcrumbs
- [ ] Context menu
- [ ] Refresh
- [ ] File-type icons
- [ ] Keyboard navigation
- [ ] Large-folder optimization

### Phase 3 — Storage Intelligence

- [ ] Storage overview
- [ ] Largest files
- [ ] Largest folders
- [ ] Storage breakdown
- [ ] File-type breakdown
- [ ] Visual storage indicators

### Phase 4 — Advanced Features

- [ ] Shared Drives
- [ ] Export tree
- [ ] PNG/SVG export
- [ ] JSON export
- [ ] Dark mode
- [ ] Custom themes
- [ ] Multi-account support
- [ ] Additional visualization options

### Phase 5 — Future Providers

- [ ] OneDrive adapter
- [ ] Dropbox adapter
- [ ] Additional cloud storage providers

## Repository Structure

```text
TreeSpace/
├── .github/
│   └── ISSUE_TEMPLATE/
├── docs/
│   ├── architecture.md
│   ├── roadmap.md
│   ├── google-drive-api.md
│   └── decisions.md
├── public/
│   └── icons/
├── src/
│   ├── background/
│   ├── components/
│   │   ├── tree/
│   │   ├── branch/
│   │   ├── radial/
│   │   └── common/
│   ├── models/
│   ├── options/
│   ├── popup/
│   ├── services/
│   │   ├── google-drive/
│   │   └── storage/
│   ├── types/
│   └── utils/
├── tests/
├── manifest.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── LICENSE
└── .gitignore
```

## Development Principles

- Use the Google Drive API rather than scraping the Drive web interface.
- Keep provider-specific logic inside provider adapters.
- Keep visualization components independent from the data provider.
- Treat shortcuts as references, not duplicated storage.
- Avoid unnecessary permissions.
- Keep the extension responsive for large folder trees.

## License

See [LICENSE](LICENSE).
