# TreeSpace

> Visualize Google Drive folders as DSA-style trees.

TreeSpace is a Chromium browser extension that turns a Google Drive folder into an interactive visual tree. Instead of navigating a folder only as a list, TreeSpace represents the folder hierarchy as a data structure that can be explored visually.

## Project Status

**Current phase:** Phase 1 — Core MVP  
**Status:** Authentication and Master Folder selection

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

- [x] Chromium Manifest V3 extension foundation
- [x] Google authentication
- [x] Google Drive folder selection
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

## Local Google Drive Setup

TreeSpace uses the Chromium Identity API with a Google OAuth client configured as a **Chrome Extension** application. The client ID is intentionally not committed.

1. Create or select a Google Cloud project.
2. Enable the Google Drive API.
3. Configure the Google Auth Platform consent screen and add the scope `https://www.googleapis.com/auth/drive.metadata.readonly`.
4. Create a Chrome Extension OAuth client and use the TreeSpace extension ID as its Item ID.
5. Add any external test accounts to the OAuth consent screen's test users.
6. Build with the client ID in the environment:

   ```sh
   TREESPACE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com npm run build
   ```

The generated `dist/manifest.json` contains the client ID. The committed `manifest.json` contains only a placeholder, and no client secret is used or required. See [docs/google-oauth-setup.md](docs/google-oauth-setup.md) for extension ID and unpacked-extension details.

## License

See [LICENSE](LICENSE).
