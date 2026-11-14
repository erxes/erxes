import type { ProductCategory } from '@erxes/core-contract';

export interface CategoryNode {
  category: ProductCategory;
  /** 0 for a top-level category. */
  depth: number;
  /** Its name under its parents' names: "Drinks / Coffee". */
  path: string;
  hasChildren: boolean;
}

/**
 * Categories in tree order: each one followed by those under it, siblings by
 * name. A category whose parent is gone shows at the top level.
 */
export const categoryTree = (categories: ProductCategory[]): CategoryNode[] => {
  const known = new Set(categories.map((category) => category.id));
  const sorted = categories.toSorted((a, b) => a.name.localeCompare(b.name));

  const childrenOf = (parentId: string | null) =>
    sorted.filter((category) =>
      parentId === null
        ? category.parentId === null || !known.has(category.parentId)
        : category.parentId === parentId,
    );

  const walk = (parentId: string | null, depth: number, prefix: string): CategoryNode[] =>
    childrenOf(parentId).flatMap((category) => {
      const path = prefix ? `${prefix} / ${category.name}` : category.name;
      const children = walk(category.id, depth + 1, path);

      return [{ category, depth, path, hasChildren: children.length > 0 }, ...children];
    });

  return walk(null, 0, '');
};

/** The category and every category under it (where it can't be moved). */
export const categoryWithDescendants = (categories: ProductCategory[], id: string) => {
  const ids = new Set([id]);
  let grew = true;

  while (grew) {
    grew = false;

    for (const category of categories) {
      if (category.parentId && ids.has(category.parentId) && !ids.has(category.id)) {
        ids.add(category.id);
        grew = true;
      }
    }
  }

  return ids;
};
