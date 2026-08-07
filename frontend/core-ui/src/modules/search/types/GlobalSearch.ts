import { TSearchGroupResult, TSearchResultItem } from 'erxes-ui';

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
};
