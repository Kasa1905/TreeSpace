import type { TreeNode as TreeNodeModel } from "../../models/tree-node";
import type { TreeViewState } from "../../types/tree-runtime";
import { TreeNode } from "./TreeNode";
import "./classic-tree.css";

interface ClassicTreeProps {
  tree: TreeNodeModel;
  viewState: TreeViewState;
  onToggle: (nodeId: string) => void;
  onOpen?: (node: TreeNodeModel) => void;
}

export function ClassicTree({ tree, viewState, onToggle, onOpen = openDriveItem }: ClassicTreeProps) {
  return (
    <section className="classic-tree" aria-label="Classic Tree visualization">
      <div className="classic-tree__heading">
        <p className="foundation-page__eyebrow">Classic Tree</p>
        <span>{viewState.expandedNodeIds.size} expanded</span>
      </div>
      <ul className="classic-tree__root">
        <TreeNode
          node={tree}
          depth={0}
          viewState={viewState}
          onToggle={onToggle}
          onOpen={onOpen}
        />
      </ul>
    </section>
  );
}

function openDriveItem(node: TreeNodeModel): void {
  void chrome.tabs.create({ url: node.url });
}
