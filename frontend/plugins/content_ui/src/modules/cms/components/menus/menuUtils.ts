export type RawMenuItem = {
  _id: string;
  label: string;
  parentId?: string;
  [key: string]: any;
};

export function buildFlatTree<T extends RawMenuItem>(
  items: T[],
): (T & { depth: number })[] {
  const result: (T & { depth: number })[] = [];
  const addChildren = (parentId: string | null, depth: number) => {
    items
      .filter((item) => (item.parentId || null) === parentId)
      .forEach((item) => {
        result.push({ ...item, depth });
        addChildren(item._id, depth + 1);
      });
  };
  addChildren(null, 0);
  return result;
}

export function getDepthPrefix(depth: number): string {
  if (depth === 0) return '';
  if (depth === 1) return '- ';
  return '-- ';
}
