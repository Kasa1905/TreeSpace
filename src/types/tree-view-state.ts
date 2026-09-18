export interface TreeViewState {
  expandedNodeIds: ReadonlySet<string>;
  currentNodeId?: string;
}
