import { OperationVariables, useQuery } from '@apollo/client';
import { useMultiQueryState } from 'erxes-ui';
import { GET_FXA_OWNER_RECORDS } from '../graphql/queries/fixedAssets';
import { IFxaOwnerRecord } from '../types/FixedAsset';

const FXA_OWNER_RECORDS_PER_PAGE = 20;

type TFxaOwnerRecordQueryParams = {
  searchValue?: string | null;
  fixedAssetId?: string | null;
  categoryId?: string | null;
  action?: string | null;
  ownerId?: string | null;
  status?: string | null;
  createdDate?: string | { from?: string; to?: string } | null;
};

type TActiveFxaOwnerRecordQueryParams = {
  searchValue?: string;
  fixedAssetId?: string;
  categoryId?: string;
  action?: string;
  ownerId?: string;
  status?: string;
};

const FXA_OWNER_RECORD_FILTER_KEYS: (keyof TFxaOwnerRecordQueryParams)[] = [
  'fixedAssetId',
  'searchValue',
  'categoryId',
  'action',
  'ownerId',
  'status',
  'createdDate',
];

export const useFxaOwnerRecordQueryParams = () => {
  const [queryParams] = useMultiQueryState<TFxaOwnerRecordQueryParams>(
    FXA_OWNER_RECORD_FILTER_KEYS,
  );

  return queryParams || {};
};

const getDateRange = (
  createdDate?: TFxaOwnerRecordQueryParams['createdDate'],
) => {
  if (!createdDate) {
    return {};
  }

  if (typeof createdDate === 'string') {
    return { createdFrom: createdDate, createdTo: createdDate };
  }

  return {
    createdFrom: createdDate.from,
    createdTo: createdDate.to || createdDate.from,
  };
};

const getActiveFilters = (
  filters: Omit<TFxaOwnerRecordQueryParams, 'createdDate'>,
) =>
  Object.fromEntries(
    Object.entries(filters).filter(([, value]) => Boolean(value)),
  ) as TActiveFxaOwnerRecordQueryParams;

export const useFxaOwnerRecordVariables = () => {
  const queryParams = useFxaOwnerRecordQueryParams();
  const { createdDate, ...filters } = queryParams;

  return {
    status: 'active',
    page: 1,
    perPage: FXA_OWNER_RECORDS_PER_PAGE,
    ...getActiveFilters(filters),
    ...getDateRange(createdDate),
  };
};

export const useFxaOwnerRecords = (options?: OperationVariables) => {
  const variables = useFxaOwnerRecordVariables();
  const { data, loading, error, fetchMore, refetch } = useQuery<{
    fxaOwnerRecords: IFxaOwnerRecord[];
    fxaOwnerRecordsCount: number;
  }>(GET_FXA_OWNER_RECORDS, {
    ...options,
    variables: {
      ...variables,
      ...options?.variables,
    },
  });
  const fxaOwnerRecords = data?.fxaOwnerRecords || [];
  const totalCount = data?.fxaOwnerRecordsCount || 0;

  const handleFetchMore = () => {
    if (loading || fxaOwnerRecords.length >= totalCount) {
      return;
    }

    fetchMore({
      variables: {
        ...variables,
        ...options?.variables,
        page:
          Math.ceil(fxaOwnerRecords.length / FXA_OWNER_RECORDS_PER_PAGE) + 1,
        perPage: FXA_OWNER_RECORDS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        return {
          ...prev,
          ...fetchMoreResult,
          fxaOwnerRecords: [
            ...(prev.fxaOwnerRecords || []),
            ...(fetchMoreResult.fxaOwnerRecords || []),
          ],
          fxaOwnerRecordsCount: fetchMoreResult.fxaOwnerRecordsCount,
        };
      },
    });
  };

  return {
    fxaOwnerRecords,
    totalCount,
    loading,
    error,
    handleFetchMore,
    refetch,
  };
};
