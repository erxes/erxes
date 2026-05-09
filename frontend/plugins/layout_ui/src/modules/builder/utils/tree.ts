import { BuilderNode } from '../types';

export const findNode = (
  root: BuilderNode,
  nodeId: string,
): BuilderNode | null => {
  if (root.id === nodeId) return root;
  for (const child of root.children ?? []) {
    const hit = findNode(child, nodeId);
    if (hit) return hit;
  }
  return null;
};

export const findParent = (
  root: BuilderNode,
  nodeId: string,
): { parent: BuilderNode; index: number } | null => {
  for (let i = 0; i < (root.children?.length ?? 0); i++) {
    const child = root.children![i];
    if (child.id === nodeId) return { parent: root, index: i };
    const hit = findParent(child, nodeId);
    if (hit) return hit;
  }
  return null;
};

export const mapTree = (
  root: BuilderNode,
  visit: (node: BuilderNode) => BuilderNode,
): BuilderNode => {
  const next = visit(root);
  if (!next.children) return next;
  return {
    ...next,
    children: next.children.map((c) => mapTree(c, visit)),
  };
};

export const insertAt = (
  root: BuilderNode,
  parentId: string,
  index: number,
  node: BuilderNode,
): BuilderNode => {
  return mapTree(root, (n) => {
    if (n.id !== parentId) return n;
    const next = [...(n.children ?? [])];
    const safeIndex = Math.max(0, Math.min(index, next.length));
    next.splice(safeIndex, 0, node);
    return { ...n, children: next };
  });
};

export const removeAt = (
  root: BuilderNode,
  nodeId: string,
): BuilderNode => {
  return mapTree(root, (n) => {
    if (!n.children?.length) return n;
    const next = n.children.filter((c) => c.id !== nodeId);
    if (next.length === n.children.length) return n;
    return { ...n, children: next };
  });
};

export const replaceProps = (
  root: BuilderNode,
  nodeId: string,
  patch: Record<string, unknown>,
): BuilderNode => {
  return mapTree(root, (n) => {
    if (n.id !== nodeId) return n;
    return { ...n, props: { ...n.props, ...patch } };
  });
};

export const moveNode = (
  root: BuilderNode,
  nodeId: string,
  newParentId: string,
  newIndex: number,
): BuilderNode => {
  const node = findNode(root, nodeId);
  if (!node) return root;
  if (nodeId === newParentId) return root;
  if (findNode(node, newParentId)) return root;
  const removed = removeAt(root, nodeId);
  return insertAt(removed, newParentId, newIndex, node);
};

export const cloneWithNewIds = (
  node: BuilderNode,
  newId: () => string,
): BuilderNode => ({
  ...node,
  id: newId(),
  children: node.children?.map((c) => cloneWithNewIds(c, newId)),
});
