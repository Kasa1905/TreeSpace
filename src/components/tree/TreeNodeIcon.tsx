import type { TreeNodeType } from "../../models/tree-node";

interface TreeNodeIconProps {
  type: TreeNodeType;
  mimeType?: string;
}

export function TreeNodeIcon({ type, mimeType }: TreeNodeIconProps) {
  if (type === "folder") {
    return <span className="tree-node-icon" aria-label="Folder">Folder</span>;
  }

  if (type === "shortcut") {
    return <span className="tree-node-icon tree-node-icon--shortcut" aria-label="Shortcut">Link</span>;
  }

  return <span className="tree-node-icon" aria-label={getFileKind(mimeType)}>{getFileKind(mimeType)}</span>;
}

function getFileKind(mimeType?: string): string {
  if (!mimeType) {
    return "File";
  }
  if (mimeType === "application/pdf") {
    return "PDF";
  }
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
    return "Sheet";
  }
  if (mimeType.includes("document") || mimeType.includes("word")) {
    return "Doc";
  }
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) {
    return "Slides";
  }
  if (mimeType.startsWith("image/")) {
    return "Image";
  }
  if (mimeType.startsWith("audio/")) {
    return "Audio";
  }
  if (mimeType.startsWith("video/")) {
    return "Video";
  }
  if (mimeType.includes("zip") || mimeType.includes("compressed")) {
    return "Archive";
  }
  if (mimeType.startsWith("text/") || /javascript|typescript|python|java|cpp/.test(mimeType)) {
    return "Code";
  }
  return "File";
}
