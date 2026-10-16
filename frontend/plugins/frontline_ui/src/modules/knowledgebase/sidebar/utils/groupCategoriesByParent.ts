import { ICategoryFields } from '@/knowledgebase/types';

export const ROOT_CATEGORY_KEY = '';

export type TCategoryNode = Pick<
  ICategoryFields,
  '_id' | 'title' | 'parentCategoryId'
>;

const byTitle = (a: TCategoryNode, b: TCategoryNode) =>
  (a.title || '').localeCompare(b.title || '', undefined, {
    numeric: true,
    sensitivity: 'base',
  });

export const groupCategoriesByParent = <T extends TCategoryNode>(
  categories: T[],
) => {
  const ids = new Set(categories.map((category) => category._id));
  const childrenOf = new Map<string, T[]>();

  categories.forEach((category) => {
    const parentId =
      category.parentCategoryId && ids.has(category.parentCategoryId)
        ? category.parentCategoryId
        : ROOT_CATEGORY_KEY;

    childrenOf.set(parentId, [...(childrenOf.get(parentId) ?? []), category]);
  });

  const groups = new Map<string, T[]>();
  const visited = new Set<string>();

  const attach = (parentId: string, children: T[]) => {
    const fresh = children.filter((child) => !visited.has(child._id));

    if (fresh.length === 0) return;

    fresh.forEach((child) => visited.add(child._id));
    groups.set(
      parentId,
      [...(groups.get(parentId) ?? []), ...fresh].sort(byTitle),
    );
    fresh.forEach((child) =>
      attach(child._id, childrenOf.get(child._id) ?? []),
    );
  };

  attach(ROOT_CATEGORY_KEY, childrenOf.get(ROOT_CATEGORY_KEY) ?? []);

  categories.forEach((category) => {
    if (!visited.has(category._id)) {
      attach(ROOT_CATEGORY_KEY, [category]);
    }
  });

  return groups;
};
