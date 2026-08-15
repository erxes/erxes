import {
  TSearchGroupResult,
  TSearchPageInfo,
  TSearchResultItem,
} from 'erxes-ui';

export type TGlobalSearchCategory = string;

export type TNavigationSearchItem = TSearchResultItem & {
  activityId: string;
  icon?: React.ElementType;
};

export type TGlobalSearchGroupStatus = 'ok' | 'error';

export type TGlobalSearchGroup = {
  key: string;
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
};

export type TGlobalSearchCategoryOption = {
  key: TGlobalSearchCategory;
  label: string;
  labelKey?: string;
  labelNamespace?: string;
};
