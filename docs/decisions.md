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
