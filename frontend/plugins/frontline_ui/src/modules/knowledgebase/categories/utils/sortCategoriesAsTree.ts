import { ICategory } from '@/knowledgebase/types';

export type TCategoryRow = ICategory & {
  depth: number;
  totalArticles: number;
  hasChildren: boolean;
};

const byTitle = (a: ICategory, b: ICategory) =>
  (a.title || '').localeCompare(b.title || '', undefined, {
    numeric: true,
    sensitivity: 'base',
  });

const isRoot = (category: ICategory, categories: ICategory[]) =>
  !category.parentCategoryId ||
  !categories.some((parent) => parent._id === category.parentCategoryId);

const getChildCategories = (
  categories: ICategory[],
  parentId: string,
): ICategory[] =>
  categories
    .filter((child) => child.parentCategoryId === parentId)
    .sort(byTitle);

const getRootCategories = (categories: ICategory[]): ICategory[] =>
  categories.filter((category) => isRoot(category, categories)).sort(byTitle);

export const getCategoryWithDescendantIds = (
  categories: ICategory[],
  categoryId: string,
): string[] => {
  const ids: string[] = [];
  const visit = (id: string) => {
    if (ids.includes(id)) return;

    ids.push(id);
    categories
      .filter((child) => child.parentCategoryId === id)
      .forEach((child) => visit(child._id));
  };

  visit(categoryId);

  return ids;
};

export const countCategoryArticles = (
  categories: ICategory[],
  categoryId: string,
): number =>
  getCategoryWithDescendantIds(categories, categoryId).reduce(
    (total, id) =>
      total +
      (categories.find((category) => category._id === id)?.numOfArticles ?? 0),
    0,
  );

export const countTopicArticles = (categories: ICategory[]): number =>
  categories.reduce(
    (total, category) => total + (category.numOfArticles ?? 0),
    0,
  );

export const sortCategoriesAsTree = (
  categories: ICategory[],
): TCategoryRow[] => {
  const rows: TCategoryRow[] = [];
  const visited = new Set<string>();

  const toRow = (category: ICategory, depth: number): TCategoryRow => ({
    ...category,
    depth,
    totalArticles: countCategoryArticles(categories, category._id),
    hasChildren: categories.some(
      (child) => child.parentCategoryId === category._id,
    ),
  });

  const push = (category: ICategory, depth: number) => {
    if (visited.has(category._id)) return;

    visited.add(category._id);
    rows.push(toRow(category, depth));

    getChildCategories(categories, category._id).forEach((child) =>
      push(child, depth + 1),
    );
  };

  getRootCategories(categories).forEach((root) => push(root, 0));

  categories.forEach((category) => {
    if (visited.has(category._id)) return;

    rows.push(toRow(category, 0));
  });

  return rows;
};
