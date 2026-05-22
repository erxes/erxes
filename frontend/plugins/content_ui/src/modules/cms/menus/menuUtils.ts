export type RawMenuItem = {
  _id: string;
  label: string;
  parentId?: string;
  order?: number;
  [key: string]: unknown;
};

function compareMenuItems<T extends RawMenuItem>(a: T, b: T): number {
  const aOrder = a.order ?? Number.MAX_SAFE_INTEGER;
  const bOrder = b.order ?? Number.MAX_SAFE_INTEGER;

  if (aOrder !== bOrder) {
    return aOrder - bOrder;
  }

  return a.label.localeCompare(b.label, 'en', {
    numeric: true,
    sensitivity: 'base',
  });
}

export function buildFlatTree<T extends RawMenuItem>(
  items: T[],
): (T & { depth: number })[] {
  const result: (T & { depth: number })[] = [];
  const addChildren = (parentId: string | null, depth: number) => {
    items
      .filter((item) => (item.parentId || null) === parentId)
      .sort(compareMenuItems)
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
