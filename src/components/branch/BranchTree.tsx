import type { TreeNode as TreeNodeModel } from "../../models/tree-node";
import type { TreeViewState } from "../../types/tree-runtime";
import { TreeNodeIcon } from "../tree/TreeNodeIcon";
import { formatSize } from "../../utils/format-size";
import "./branch-tree.css";

interface BranchTreeProps {
  tree: TreeNodeModel;
  viewState: TreeViewState;
  onToggle: (nodeId: string) => void;
  onOpen?: (node: TreeNodeModel) => void;
}

interface BranchNodeProps extends Omit<BranchTreeProps, "tree"> {
  node: TreeNodeModel;
  onOpen: (node: TreeNodeModel) => void;
}

export function BranchTree({ tree, viewState, onToggle, onOpen = openDriveItem }: BranchTreeProps) {
  return (
    <section className="branch-tree" aria-label="Branch Tree visualization">
      <div className="branch-tree__heading">
        <p className="foundation-page__eyebrow">Branch Tree</p>
        <span>{viewState.expandedNodeIds.size} expanded</span>
      </div>
      <ul className="branch-tree__root">
        <BranchNode
          node={tree}
          viewState={viewState}
          onToggle={onToggle}
          onOpen={onOpen}
        />
      </ul>
    </section>
  );
}

function BranchNode({ node, viewState, onToggle, onOpen }: BranchNodeProps) {
  const isFolder = node.type === "folder";
  const expanded = viewState.expandedNodeIds.has(node.id);
  const children = node.children ?? [];
  const isCurrent = viewState.currentFolderId === node.id;

  return (
    <li className={`branch-tree__branch${isCurrent ? " branch-tree__branch--current" : ""}`}>
      <div className="branch-tree__node-wrap">
        <button
          type="button"
          className="branch-tree__node"
          aria-expanded={isFolder ? expanded : undefined}
          aria-label={isFolder ? `${expanded ? "Collapse" : "Expand"} ${node.name}` : `Open ${node.name}`}
          onClick={() => (isFolder ? onToggle(node.id) : onOpen(node))}
        >
          {isFolder && <span className="branch-tree__caret" aria-hidden="true">{expanded ? "-" : ">"}</span>}
          {!isFolder && <span className="branch-tree__caret-spacer" aria-hidden="true" />}
          <TreeNodeIcon type={node.type} mimeType={node.mimeType} />
          <span className="branch-tree__name">{node.name}</span>
          {node.type === "shortcut" && <span className="branch-tree__badge">Shortcut</span>}
          <span className="branch-tree__size">{formatSize(node.size)}</span>
        </button>
      </div>
      {isFolder && expanded && (
        <ul className="branch-tree__children">
          {children.length > 0 ? children.map((child) => (
            <BranchNode
              key={child.id}
              node={child}
              viewState={viewState}
              onToggle={onToggle}
              onOpen={onOpen}
            />
          )) : (
            <li className="branch-tree__empty">Empty folder</li>
          )}
        </ul>
      )}
    </li>
  );
}

function openDriveItem(node: TreeNodeModel): void {
  void chrome.tabs.create({ url: node.url });
}
