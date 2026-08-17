import {
  TGlobalSearchCategory,
  TGlobalSearchCategoryOption,
  TGlobalSearchGroup,
  TNavigationSearchItem,
} from '@/search/types/GlobalSearch';
import { TSearchResultItem } from 'erxes-ui';

export const appendUniqueSearchItems = (
  currentItems: TSearchResultItem[],
  nextItems: TSearchResultItem[],
) => {
  const seenIds = new Set(currentItems.map((item) => item.id));

  return [
    ...currentItems,
    ...nextItems.filter((item) => !seenIds.has(item.id)),
  ];
};

export const buildGlobalSearchCategories = ({
  hasSearchValue,
  goToItemCount,
  groups,
}: {
  hasSearchValue: boolean;
  goToItemCount: number;
  groups: TGlobalSearchGroup[];
}): TGlobalSearchCategoryOption[] => [
  { key: 'all', label: 'All' },
  ...(hasSearchValue && goToItemCount > 0
    ? [{ key: 'go-to', label: 'Go to' }]
    : []),
  ...(hasSearchValue
    ? groups
        .filter((group) => group.status === 'ok' && group.items.length > 0)
        .map((group) => ({
          key: group.key,
          label: group.label,
          labelKey: group.labelKey,
          labelNamespace: group.labelNamespace,
        }))
    : []),
];

export const getGlobalSearchTotalCount = ({
  category,
  goToItems,
  groups,
}: {
  category: TGlobalSearchCategory;
  goToItems: TNavigationSearchItem[];
  groups: TGlobalSearchGroup[];
}) => {
  if (category === 'go-to') {
    return goToItems.length;
  }

  const availableGroups = groups.filter(
    (group) => group.status === 'ok' && group.items.length > 0,
  );

  if (category !== 'all') {
    return (
      availableGroups.find((group) => group.key === category)?.totalCount ?? 0
    );
  }

  return (
    goToItems.length +
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
