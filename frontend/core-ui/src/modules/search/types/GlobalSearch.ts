import {
  TSearchGroupResult,
  TSearchPageInfo,
  TSearchResultItem,
} from 'erxes-ui';

export type TGlobalSearchCategory =
  | 'all'
  | 'navigation'
  | TSearchProviderCategory
  | (string & {});

export type TNavigationSearchItemCategory =
  | 'navigation'
  | 'plugins'
  | 'settings'
  | 'core-modules';

export type TSearchProviderCategory =
  | 'plugins'
  | 'settings'
  | 'core-modules';

export type TNavigationCategoryCounts = Record<
  TNavigationSearchItemCategory,
  number
>;

export type TNavigationSearchItem = TSearchResultItem & {
  activityId?: string;
  category?: TNavigationSearchItemCategory;
  icon?: React.ElementType;
};

export type TGlobalSearchGroupStatus = 'ok' | 'error';

export type TGlobalSearchGroup = {
  key: string;
  category: TSearchProviderCategory;
  label: string;
  labelKey?: string;
  labelNamespace?: string;
  icon?: React.ElementType;
  status: TGlobalSearchGroupStatus;
  items: TSearchResultItem[];
  totalCount: number;
  countMode: TSearchGroupResult['countMode'];
  pageInfo: TSearchPageInfo;
  loadingMore: boolean;
  loadMoreError: boolean;
  searchValue: string;
};

export type TGlobalSearchCategoryOption = {
  key: TGlobalSearchCategory;
  label: string;
  labelKey?: string;
  labelNamespace?: string;
  count?: number;
};