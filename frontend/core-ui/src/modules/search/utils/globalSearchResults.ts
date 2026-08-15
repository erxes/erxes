import {
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
  ...(goToItemCount > 0 ? [{ key: 'go-to', label: 'Go to' }] : []),
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

export const getMaterializedGlobalSearchTotalCount = ({
  goToItems,
  groups,
}: {
  goToItems: TNavigationSearchItem[];
  groups: TGlobalSearchGroup[];
}) =>
  goToItems.length +
  groups.reduce(
    (total, group) => total + (group.status === 'ok' ? group.items.length : 0),
    0,
  );

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
