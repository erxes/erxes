import { useQuery } from '@apollo/client';
import { parseDateRangeFromString, useMultiQueryState } from 'erxes-ui';
import { GET_FIXED_ASSET_LOCATION_REMAINDERS } from '@/settings/fixed-assets/graphql/queries/fixedAssets';
import { IFixedAssetLocationRemainder } from '@/settings/fixed-assets/types/FixedAsset';

const FIXED_ASSET_REMAINDER_LIMIT = 200;

type TFixedAssetRemainderQueryParams = {
  searchValue?: string;
  fixedAssetId?: string;
  categoryId?: string;
  branchId?: string;
  departmentId?: string;
  date?: string;
};

const FILTER_KEYS: (keyof TFixedAssetRemainderQueryParams)[] = [
  'searchValue',
  'fixedAssetId',
  'categoryId',
  'branchId',
  'departmentId',
  'date',
];

const getDateValue = (date?: string) => {
  if (!date) {
    return undefined;
  }

  return parseDateRangeFromString(date)?.to.toISOString() || date;
};

export const useFixedAssetRemainderVariables = () => {
  const [queryParams] =
    useMultiQueryState<TFixedAssetRemainderQueryParams>(FILTER_KEYS);

  return {
    ...Object.fromEntries(
      Object.entries(queryParams || {}).filter(
        ([key, value]) => key !== 'date' && Boolean(value),
      ),
    ),
    date: getDateValue(queryParams?.date || undefined),
    limit: FIXED_ASSET_REMAINDER_LIMIT,
  };
};

export const useFixedAssetRemainders = () => {
  const variables = useFixedAssetRemainderVariables();
  const { data, loading, error, refetch } = useQuery<{
    fixedAssetLocationRemainders: IFixedAssetLocationRemainder[];
  }>(GET_FIXED_ASSET_LOCATION_REMAINDERS, { variables });

  return {
    fixedAssetRemainders: data?.fixedAssetLocationRemainders || [],
    loading,
    error,
    refetch,
  };
};
