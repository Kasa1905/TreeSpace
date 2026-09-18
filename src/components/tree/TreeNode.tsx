import type { CSSProperties } from "react";
import type { TreeNode as TreeNodeModel } from "../../models/tree-node";
import type { TreeViewState } from "../../types/tree-runtime";
import { formatSize } from "../../utils/format-size";
import { TreeNodeIcon } from "./TreeNodeIcon";

interface TreeNodeProps {
  node: TreeNodeModel;
  depth: number;
  viewState: TreeViewState;
  onToggle: (nodeId: string) => void;
  onOpen: (node: TreeNodeModel) => void;
}

export function TreeNode({ node, depth, viewState, onToggle, onOpen }: TreeNodeProps) {
  const hasChildren = node.type === "folder" && (node.children?.length ?? 0) > 0;
  const expanded = viewState.expandedNodeIds.has(node.id);
  const isCurrent = viewState.currentFolderId === node.id;
  const isFolder = node.type === "folder";

  return (
    <li className={`classic-tree__item${isCurrent ? " classic-tree__item--current" : ""}`}>
      <div className="classic-tree__row" style={{ "--tree-depth": depth } as CSSProperties}>
        {isFolder ? (
          <button
            type="button"
            className="classic-tree__toggle"
            aria-label={`${expanded ? "Collapse" : "Expand"} ${node.name}`}
            aria-expanded={expanded}
            onClick={() => onToggle(node.id)}
          >
            {expanded ? "-" : ">"}
          </button>
        ) : (
          <span className="classic-tree__toggle-spacer" aria-hidden="true" />
        )}
        <button
          type="button"
          className="classic-tree__node-button"
          onClick={() => (isFolder ? onToggle(node.id) : onOpen(node))}
        >
          <TreeNodeIcon type={node.type} mimeType={node.mimeType} />
          <span className="classic-tree__name">{node.name}</span>
          {node.type === "shortcut" && <span className="classic-tree__badge">Shortcut</span>}
        </button>
        <span className="classic-tree__size">{formatSize(node.size)}</span>
      </div>
      {isFolder && expanded && (
        <ul className="classic-tree__children">
          {hasChildren ? node.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              viewState={viewState}
              onToggle={onToggle}
              onOpen={onOpen}
            />
          )) : (
            <li className="classic-tree__empty">Empty folder</li>
          )}
        </ul>
      )}
    </li>
  );
}
