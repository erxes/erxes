export type RawMenuItem = {
  _id: string;
  label: string;
  parentId?: string;
  order?: number;
  [key: string]: unknown;
};

export function buildFlatTree<T extends RawMenuItem>(
  items: T[],
): (T & { depth: number })[] {
  const result: (T & { depth: number })[] = [];
  const sortMenuItems = (a: T, b: T) => {
    const orderA =
      typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
    const orderB =
      typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.label.localeCompare(b.label, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  };

  const addChildren = (parentId: string | null, depth: number) => {
    items
      .filter((item) => (item.parentId || null) === parentId)
      .sort(sortMenuItems)
      .forEach((item) => {
        result.push({ ...item, depth });
        addChildren(item._id, depth + 1);
      });
  };
  addChildren(null, 0);
  return result;
}

export function getDepthPrefix(depth: number): string {
  if (depth <= 0) return '';
  return '-'.repeat(depth) + ' ';
}
