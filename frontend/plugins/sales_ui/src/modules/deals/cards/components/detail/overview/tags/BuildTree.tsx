import { ITag } from 'ui-modules';

export type TagNode = ITag & { children: TagNode[] };

export function buildTree(flatTags: ITag[]): TagNode[] {
  const map = new Map<string, TagNode>();
  const roots: TagNode[] = [];

  flatTags.forEach((tag) => {
    map.set(tag._id, { ...tag, children: [] });
  });

  map.forEach((node) => {
    if (node.parentId) {
      const parent = map.get(node.parentId);
      parent?.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}
