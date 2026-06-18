export type RawMenuItem = {
  _id: string;
  label: string;
  parentId?: string;
  order?: number;
  [key: string]: unknown;
};

/**
 * Compares two menu items for sorting purposes.
 * Prioritizes the 'order' field, then falls back to locale-aware label comparison.
 * Items without an order are placed at the end.
 */
function compareMenuItems<T extends RawMenuItem>(
  a: T,
  b: T,
  locale = 'en',
): number {
  const aOrder = a.order ?? Number.MAX_SAFE_INTEGER;
  const bOrder = b.order ?? Number.MAX_SAFE_INTEGER;

  if (aOrder !== bOrder) {
    return aOrder - bOrder;
  }

  return a.label.localeCompare(b.label, locale, {
    numeric: true,
    sensitivity: 'base',
  });
}

/**
 * Transforms a flat list of menu items into a sorted flat tree structure.
 * Each item is enriched with its depth and the path of ancestor IDs.
 */
export function buildFlatTree<T extends RawMenuItem>(
  items: T[],
  locale = 'en',
): (T & { depth: number; path: string[] })[] {
  const result: (T & { depth: number; path: string[] })[] = [];
  const addChildren = (
    parentId: string | null,
    depth: number,
    path: string[],
  ) => {
    items
      .filter((item) => (item.parentId || null) === parentId)
      .sort((a, b) => compareMenuItems(a, b, locale))
      .forEach((item) => {
        result.push({ ...item, depth, path });
        addChildren(item._id, depth + 1, [...path, item._id]);
      });
  };
  addChildren(null, 0, []);
  return result;
}

/**
 * Generates a visual indentation prefix based on the nesting depth.
 */
export function getDepthPrefix(depth: number): string {
  if (depth <= 0) return '';
  return '-'.repeat(depth) + ' ';
}
