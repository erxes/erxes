import { ICategory } from '@/knowledgebase/types';

export type TCategoryRow = ICategory & { depth: number };

const byTitle = (a: ICategory, b: ICategory) =>
  (a.title || '').localeCompare(b.title || '', undefined, {
    numeric: true,
    sensitivity: 'base',
  });

export const sortCategoriesAsTree = (
  categories: ICategory[],
): TCategoryRow[] => {
  const rows: TCategoryRow[] = [];
  const visited = new Set<string>();

  const push = (category: ICategory, depth: number) => {
    if (visited.has(category._id)) return;

    visited.add(category._id);
    rows.push({ ...category, depth });

    categories
      .filter((child) => child.parentCategoryId === category._id)
      .sort(byTitle)
      .forEach((child) => push(child, depth + 1));
  };

  categories
    .filter(
      (category) =>
        !category.parentCategoryId ||
        !categories.some((parent) => parent._id === category.parentCategoryId),
    )
    .sort(byTitle)
    .forEach((root) => push(root, 0));

  categories.forEach((category) => {
    if (visited.has(category._id)) return;

    rows.push({ ...category, depth: 0 });
  });

  return rows;
};
