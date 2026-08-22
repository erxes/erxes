import {
  TGlobalSearchCategory,
  TGlobalSearchCategoryOption,
  TGlobalSearchGroup,
  TGlobalSearchSortOrder,
  TGlobalSearchSubcategoryOption,
  TNavigationCategoryCounts,
  TSearchProviderCategory,
} from '@/search/types/GlobalSearch';
import { TSearchResultItem } from 'erxes-ui';

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const getObjectIdTimestamp = (id: string): number | null =>
  OBJECT_ID_PATTERN.test(id) ? Number.parseInt(id.slice(0, 8), 16) : null;

export const compareGlobalSearchItems = (
  left: TSearchResultItem,
  right: TSearchResultItem,
  order: TGlobalSearchSortOrder,
): number => {
  const leftTimestamp = getObjectIdTimestamp(left.id);
  const rightTimestamp = getObjectIdTimestamp(right.id);

  if (leftTimestamp === null || rightTimestamp === null) return 0;

  const difference = leftTimestamp - rightTimestamp;

  return order === 'oldest' ? difference : -difference;
};

export const sortGlobalSearchItems = <T extends TSearchResultItem>(
  items: T[],
  order: TGlobalSearchSortOrder,
): T[] =>
  [...items].sort((left, right) =>
    compareGlobalSearchItems(left, right, order),
  );

const toSingular = (value: string): string =>
  value.length > 1 && value.endsWith('s') && !value.endsWith('ss')
    ? value.slice(0, -1)
    : value;

// Matches a source by its name so typing a category/source label (e.g. "deals",
// "conversations") surfaces that source's results instead of only content text.
export const isSourceNameMatch = (
  searchValue: string,
  label?: string | null,
): boolean => {
  const term = searchValue.trim().toLowerCase();
  const name = (label ?? '').trim().toLowerCase();

  if (!term || !name) {
    return false;
  }

  return toSingular(term) === toSingular(name);
};

export type TSourceQualifier = {
  providerKeys: string[];
  query: string;
};

// Detects a leading source/category qualifier such as "deals 7211" or
// "conversation #123" and returns the owning provider plus the remaining query.
// Falls back to null so the caller can apply its exact source-name behavior.
export const parseSourceQualifier = (
  searchValue: string,
  providers: {
    key: string;
    label?: string | null;
    subcategory?: string | null;
    subcategoryLabel?: string | null;
  }[],
): TSourceQualifier | null => {
  const term = searchValue.trim().toLowerCase();

  if (!term) {
    return null;
  }

  const qualifiers = new Map<string, string[]>();

  for (const provider of providers) {
    for (const candidate of [
      provider.label,
      provider.subcategory,
      provider.subcategoryLabel,
    ]) {
      const label = (candidate ?? '').trim().toLowerCase();

      if (!label) continue;
      const keys = qualifiers.get(label) ?? [];
      if (!keys.includes(provider.key)) keys.push(provider.key);
      qualifiers.set(label, keys);
    }
  }

  for (const [label, providerKeys] of qualifiers) {
    if (!label) {
      continue;
    }

    const prefix = [label, toSingular(label)].find(
      (candidate) => candidate.length > 0 && term.startsWith(`${candidate} `),
    );

    if (!prefix) {
      continue;
    }

    const query = searchValue.slice(prefix.length).trim();

    if (query) {
      return { providerKeys, query };
    }
  }

  return null;
};

export const buildGlobalSearchSubcategories = (
  category: TGlobalSearchCategory,
  groups: TGlobalSearchGroup[],
): TGlobalSearchSubcategoryOption[] => {
  if (category !== 'plugins' && category !== 'core-modules') return [];

  const counts = new Map<string, TGlobalSearchSubcategoryOption>();
  for (const group of getAvailableContentGroups(groups)) {
    if (group.category !== category) continue;
    const current = counts.get(group.subcategory);
    counts.set(group.subcategory, {
      key: group.subcategory,
      label: group.subcategoryLabel,
      count: (current?.count ?? 0) + group.totalCount,
    });
  }

  const options = [...counts.values()].sort((a, b) =>
    a.label.localeCompare(b.label),
  );
  const total = options.reduce((sum, option) => sum + option.count, 0);

  return total > 0
    ? [{ key: 'all', label: 'All', count: total }, ...options]
    : [];
};

export const appendUniqueSearchItems = (
  currentItems: TSearchResultItem[],
  nextItems: TSearchResultItem[],
) => {
  const seenIds = new Set(currentItems.map((item) => item.id));

  return [
    ...currentItems,
    ...nextItems.filter((item) => {
      if (seenIds.has(item.id)) {
        return false;
      }
      seenIds.add(item.id);
      return true;
    }),
  ];
};

export const NAVIGATION_SEARCH_CATEGORIES: {
  key: TSearchProviderCategory;
  labelKey: string;
  defaultLabel: string;
}[] = [
  { key: 'plugins', labelKey: 'plugins', defaultLabel: 'Plugins' },
  { key: 'settings', labelKey: 'settings', defaultLabel: 'Settings' },
  {
    key: 'core-modules',
    labelKey: 'core-modules',
    defaultLabel: 'Core modules',
  },
];

const getAvailableContentGroups = (groups: TGlobalSearchGroup[]) =>
  groups.filter((group) => group.status === 'ok' && group.items.length > 0);

export const buildGlobalSearchCategories = ({
  hasSearchValue,
  navigationCounts,
  groups,
}: {
  hasSearchValue: boolean;
  navigationCounts: TNavigationCategoryCounts;
  groups: TGlobalSearchGroup[];
}): TGlobalSearchCategoryOption[] => {
  const availableGroups = getAvailableContentGroups(groups);
  const contentTotal = availableGroups.reduce(
    (total, group) => total + group.totalCount,
    0,
  );
  const contentCategoryCounts = NAVIGATION_SEARCH_CATEGORIES.map(
    ({ key, labelKey, defaultLabel }) => ({
      key,
      label: defaultLabel,
      labelKey,
      count: availableGroups
        .filter((group) => group.category === key)
        .reduce((total, group) => total + group.totalCount, 0),
    }),
  );

  const navigationOptions = [
    {
      key: 'navigation',
      label: 'Navigation',
      labelKey: 'navigation',
      count: navigationCounts.navigation,
    },
  ].filter(({ count }) => hasSearchValue && count > 0);

  const contentOptions = contentCategoryCounts.filter(
    ({ count }) => hasSearchValue && count > 0,
  );

  return [
    {
      key: 'all',
      label: 'All',
      count: hasSearchValue ? navigationCounts.navigation + contentTotal : 0,
    },
    ...navigationOptions,
    ...contentOptions,
  ];
};

export const getGlobalSearchTotalCount = ({
  category,
  navigationCounts,
  groups,
}: {
  category: TGlobalSearchCategory;
  navigationCounts: TNavigationCategoryCounts;
  groups: TGlobalSearchGroup[];
}) => {
  const availableGroups = getAvailableContentGroups(groups);

  if (category === 'navigation') {
    return navigationCounts.navigation;
  }

  if (
    category === 'plugins' ||
    category === 'settings' ||
    category === 'core-modules'
  ) {
    return availableGroups
      .filter((group) => group.category === category)
      .reduce((total, group) => total + group.totalCount, 0);
  }

  return (
    navigationCounts.navigation +
    availableGroups.reduce((total, group) => total + group.totalCount, 0)
  );
};

export const getGlobalSearchRequestState = ({
  skipped,
  queryLoading,
  hasError,
  hasData,
  hasInvalidFields,
  canQuarantineFields,
}: {
  skipped: boolean;
  queryLoading: boolean;
  hasError: boolean;
  hasData: boolean;
  hasInvalidFields: boolean;
  canQuarantineFields: boolean;
}) => {
  const recoveringSchema = hasInvalidFields && canQuarantineFields;

  return {
    loading: queryLoading || recoveringSchema,
    hasFailure:
      !skipped && !queryLoading && !recoveringSchema && hasError && !hasData,
  };
};
