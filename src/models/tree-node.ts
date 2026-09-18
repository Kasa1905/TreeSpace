export type TreeNodeType = "file" | "folder" | "shortcut";

export interface TreeNodeMetadata {
  provider: string;
  modifiedTime?: string;
}

export interface TreeNode {
  id: string;
  name: string;
  type: TreeNodeType;
  size: number;
  url: string;
  mimeType?: string;
  children?: TreeNode[];
  metadata?: TreeNodeMetadata;
}
