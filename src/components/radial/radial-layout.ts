import type { TreeNode } from "../../models/tree-node";

export interface RadialPoint {
  node: TreeNode;
  depth: number;
  x: number;
  y: number;
  parentId?: string;
}

export interface RadialLayout {
  width: number;
  height: number;
  center: number;
  points: RadialPoint[];
}

const VIEWPORT_SIZE = 620;
const LEVEL_RADIUS = 105;

export function calculateRadialLayout(
  tree: TreeNode,
  expandedNodeIds: ReadonlySet<string>
): RadialLayout {
  const descriptors: RadialDescriptor[] = [{ node: tree, depth: 0, angle: 0 }];
  addChildren(tree, 0, undefined, 0, 1, expandedNodeIds, descriptors);

  const maxDepth = descriptors.reduce((maximum, point) => Math.max(maximum, point.depth), 0);
  const radius = maxDepth * LEVEL_RADIUS;
  const size = Math.max(VIEWPORT_SIZE, radius * 2 + 160);
  const center = size / 2;
  const points = descriptors.map(({ node, depth, angle, parentId }) => ({
    node,
    depth,
    x: center + (depth * LEVEL_RADIUS) * Math.cos(angle),
    y: center + (depth * LEVEL_RADIUS) * Math.sin(angle),
    ...(parentId ? { parentId } : {})
  }));

  return {
    width: size,
    height: size,
    center,
    points
  };
}

interface RadialDescriptor {
  node: TreeNode;
  depth: number;
  angle: number;
  parentId?: string;
}

function addChildren(
  parent: TreeNode,
  parentDepth: number,
  parentId: string | undefined,
  startAngle: number,
  endAngle: number,
  expandedNodeIds: ReadonlySet<string>,
  descriptors: RadialDescriptor[]
): void {
  if (parent.type !== "folder" || !expandedNodeIds.has(parent.id)) {
    return;
  }

  const children = parent.children ?? [];
  if (children.length === 0) {
    return;
  }

  const angleStep = (endAngle - startAngle) / children.length;
  children.forEach((child, index) => {
    const angle = startAngle + angleStep * (index + 0.5);
    const depth = parentDepth + 1;
    const descriptor: RadialDescriptor = {
      node: child,
      depth,
      angle,
      parentId: parent.id
    };
    descriptors.push(descriptor);

    addChildren(
      child,
      depth,
      child.id,
      angle - angleStep / 2,
      angle + angleStep / 2,
      expandedNodeIds,
      descriptors
    );
  });
}
