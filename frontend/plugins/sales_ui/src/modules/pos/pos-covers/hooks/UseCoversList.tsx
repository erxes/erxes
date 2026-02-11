import { useQuery } from '@apollo/client';
import { useMemo, useCallback, useEffect } from 'react';
import queries from '~/modules/pos/pos-covers/graphql/queries/queries';
import { ICovers } from '@/pos/pos-covers/types/posCover';
import { useMultiQueryState, parseDateRangeFromString } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { posCoverTotalCountAtom } from '../states/usePosCoversCounts';

const COVERS_PER_PAGE = 30;

interface UseCoversListOptions {
  [key: string]: any;
}

interface UseCoversListReturn {
  loading: boolean;
  coversList: ICovers[];
  totalCount: number;
  handleFetchMore: () => void;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: null;
    endCursor: null;
  };
}

export const useCoversVariables = (options: UseCoversListOptions = {}) => {
  const [{ pos, user, dateRange }] = useMultiQueryState<{
    pos: string;
    user: string;
    dateRange: string;
  }>(['pos', 'user', 'dateRange']);

  return {
    perPage: COVERS_PER_PAGE,
    posId: pos || undefined,
    userId: user || undefined,
    startDate: parseDateRangeFromString(dateRange)?.from,
    endDate: parseDateRangeFromString(dateRange)?.to,
    ...options,
  };
};

export const useCoversList = (
  options: UseCoversListOptions = {},
): UseCoversListReturn => {
  const variables = useCoversVariables(options);
  const setPosCoverTotalCount = useSetAtom(posCoverTotalCountAtom);
  const { data, loading, fetchMore } = useQuery(queries.posCovers, {
    variables,
  });

  const transformedCoversList = useMemo(
    () =>
      data?.posCovers?.map((cover: ICovers) => ({
        _id: cover._id,
        name: cover.posName,
        status: cover.status,
        beginDate: cover.beginDate,
        endDate: cover.endDate,
        description: cover.description,
        note: cover.note,
        createdAt: cover.createdAt,
        createdBy: cover?.createdUser?.email || 'Unknown',
      })) || [],
    [data?.posCovers],
  );

  const totalCount = useMemo(
    () => data?.posCovers?.length || 0,
    [data?.posCovers],
  );

  const handleFetchMore = useCallback(() => {
    if (!data?.posCovers) return;

    fetchMore({
      variables: {
        page: Math.ceil(transformedCoversList.length / COVERS_PER_PAGE) + 1,
        ...variables,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.posCovers) {
          return prev;
        }
        return {
          ...prev,
          posCovers: [...(prev.posCovers || []), ...fetchMoreResult.posCovers],
        };
      },
    });
  }, [transformedCoversList.length, fetchMore, data?.posCovers, variables]);

  useEffect(() => {
    if (!totalCount) return;
    setPosCoverTotalCount(totalCount);
  }, [totalCount, setPosCoverTotalCount]);

  return {
    loading,
    coversList: transformedCoversList,
    totalCount,
    handleFetchMore,
    pageInfo: {
      hasNextPage: transformedCoversList.length < totalCount,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
