import { IAccountCategory } from '@/settings/account/account-categories/types/AccountCategory';

export type TAccountCategoryFilter = {
  searchValue?: string | null;
  categoryId?: string | null;
};

export const filterAccountCategories = (
  categories: IAccountCategory[],
  { searchValue, categoryId }: TAccountCategoryFilter,
) => {
  const term = searchValue?.trim().toLowerCase() ?? '';

  if (!term && !categoryId) {
    return {
      categories,
      matchedIds: new Set(categories.map(({ _id }) => _id)),
      isFiltered: false,
    };
  }

  const byId = new Map(categories.map((category) => [category._id, category]));

  const isInSubtree = (category: IAccountCategory) => {
    if (!categoryId) return true;

    const seen = new Set<string>();
    let current: IAccountCategory | undefined = category;

    while (current && !seen.has(current._id)) {
      if (current._id === categoryId) return true;
      seen.add(current._id);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }

    return false;
  };

  const matchesTerm = ({ code, name }: IAccountCategory) =>
    !term ||
    (code ?? '').toLowerCase().includes(term) ||
    (name ?? '').toLowerCase().includes(term);

  const matchedIds = new Set(
    categories
      .filter((category) => isInSubtree(category) && matchesTerm(category))
      .map(({ _id }) => _id),
  );

  const visibleIds = new Set(matchedIds);

  for (const id of matchedIds) {
    let parentId = byId.get(id)?.parentId;

    while (parentId && byId.has(parentId) && !visibleIds.has(parentId)) {
      visibleIds.add(parentId);
      parentId = byId.get(parentId)?.parentId;
    }
  }

  return {
    categories: categories.filter(({ _id }) => visibleIds.has(_id)),
    matchedIds,
    isFiltered: true,
  };
};
