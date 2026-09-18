# TreeSpace Roadmap

## Phase 1 — Core MVP

Goal: turn a Google Drive folder into an interactive DSA-style tree.

- [x] Chromium Manifest V3 extension foundation
- [x] Google authentication
- [x] Google Drive folder selection
- [x] Recursive Drive traversal
- [x] Provider-independent tree data model
- [x] File size calculation
- [x] Recursive folder size calculation
- [x] Shortcut detection and zero-size handling
- [x] Runtime tree state and data lifecycle
- [x] Classic Tree visualization
- [x] Branch Tree visualization
- [ ] Radial Tree visualization
- [x] View switching without refetching Drive data
- [ ] File/folder click handling
- [ ] New-tab behavior, ON by default
- [ ] Setting to disable new-tab behavior
- [ ] Loading/progress states
- [ ] Error handling

## Phase 2 — Navigation & Usability

- [ ] Search
- [ ] Expand All / Collapse All
- [ ] Breadcrumbs
- [ ] Context menu
- [ ] Refresh
- [ ] File-type icons
- [ ] Keyboard navigation
- [ ] Large-folder optimization

## Phase 3 — Storage Intelligence

- [ ] Storage overview
- [ ] Largest files
- [ ] Largest folders
- [ ] Storage breakdown
- [ ] File-type breakdown
- [ ] Visual storage indicators

## Phase 4 — Advanced Features

- [ ] Shared Drives
- [ ] Export tree
- [ ] PNG/SVG export
- [ ] JSON export
- [ ] Dark mode
- [ ] Custom themes
- [ ] Multi-account support
- [ ] Additional visualization options

## Phase 5 — Future Providers

- [ ] OneDrive provider adapter
- [ ] Dropbox provider adapter
- [ ] Additional cloud storage providers

## Development Rule

Features should be implemented phase by phase. New features must preserve the provider-independent tree model so future storage providers and visualization modes do not require a rewrite of the core architecture.
