import type { TreeNode as TreeNodeModel } from "../../models/tree-node";
import type { TreeViewState } from "../../types/tree-runtime";
import { formatSize } from "../../utils/format-size";
import { TreeNodeIcon } from "../tree/TreeNodeIcon";
import { calculateRadialLayout, type RadialPoint } from "./radial-layout";
import "./radial-tree.css";

interface RadialTreeProps {
  tree: TreeNodeModel;
  viewState: TreeViewState;
  onToggle: (nodeId: string) => void;
  onOpen?: (node: TreeNodeModel) => void;
}

const NODE_WIDTH = 150;
const NODE_HEIGHT = 54;

export function RadialTree({ tree, viewState, onToggle, onOpen = openDriveItem }: RadialTreeProps) {
  const layout = calculateRadialLayout(tree, viewState.expandedNodeIds);
  const pointsById = new Map(layout.points.map((point) => [point.node.id, point]));

  return (
    <section className="radial-tree" aria-label="Radial Tree visualization">
      <div className="radial-tree__heading">
        <p className="foundation-page__eyebrow">Radial Tree</p>
        <span>{viewState.expandedNodeIds.size} expanded</span>
      </div>
      <div className="radial-tree__viewport">
        <svg
          className="radial-tree__canvas"
          role="img"
          aria-label={`Radial tree rooted at ${tree.name}`}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          width={layout.width}
          height={layout.height}
        >
          <g className="radial-tree__connections" aria-hidden="true">
            {layout.points.slice(1).map((point) => {
              const parent = point.parentId ? pointsById.get(point.parentId) : undefined;
              return parent ? (
                <line
                  key={`${point.parentId}-${point.node.id}`}
                  x1={parent.x}
                  y1={parent.y}
                  x2={point.x}
                  y2={point.y}
                />
              ) : null;
            })}
          </g>
          <g className="radial-tree__nodes">
            {layout.points.map((point) => (
              <RadialNode
                key={point.node.id}
                point={point}
                expanded={viewState.expandedNodeIds.has(point.node.id)}
                isCurrent={viewState.currentFolderId === point.node.id}
                onToggle={onToggle}
                onOpen={onOpen}
              />
            ))}
          </g>
        </svg>
      </div>
    </section>
  );
}

interface RadialNodeProps {
  point: RadialPoint;
  expanded: boolean;
  isCurrent: boolean;
  onToggle: (nodeId: string) => void;
  onOpen: (node: TreeNodeModel) => void;
}

function RadialNode({ point, expanded, isCurrent, onToggle, onOpen }: RadialNodeProps) {
  const { node } = point;
  const isFolder = node.type === "folder";
  const x = point.x - NODE_WIDTH / 2;
  const y = point.y - NODE_HEIGHT / 2;

  return (
    <foreignObject
      className={`radial-tree__node${isCurrent ? " radial-tree__node--current" : ""}${point.depth === 0 ? " radial-tree__node--root" : ""}`}
      x={x}
      y={y}
      width={NODE_WIDTH}
      height={NODE_HEIGHT}
      data-node-id={node.id}
      data-depth={point.depth}
    >
      <button
        type="button"
        className="radial-tree__node-button"
        aria-expanded={isFolder ? expanded : undefined}
        aria-label={isFolder ? `${expanded ? "Collapse" : "Expand"} ${node.name}` : `Open ${node.name}`}
        onClick={() => (isFolder ? onToggle(node.id) : onOpen(node))}
      >
        <TreeNodeIcon type={node.type} mimeType={node.mimeType} />
        <span className="radial-tree__node-copy">
          <span className="radial-tree__node-name">{node.name}</span>
          <span className="radial-tree__node-meta">
            {formatSize(node.size)}
            {node.type === "shortcut" && <span className="radial-tree__shortcut">Shortcut</span>}
          </span>
        </span>
      </button>
    </foreignObject>
  );
}

function openDriveItem(node: TreeNodeModel): void {
  void chrome.tabs.create({ url: node.url });
}
