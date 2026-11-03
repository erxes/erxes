import { ICovers } from '@/pos/pos-covers/types/posCover';
import { hasId } from '@/pos/utils/posJson';
import { readPosCount } from '@/pos/utils/posOrderJson';
import { useQuery } from '@apollo/client';
import { parseDateRangeFromString, useMultiQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import type { PosCoversQueryVariables } from '~/gql/graphql';
import { posCovers } from '@/pos/pos-covers/graphql/queries/queries';
import {
  posCoverTotalCountAtom,
  posCoverTotalCountLoadingAtom,
} from '@/pos/pos-covers/states/usePosCoversCounts';

const COVERS_PER_PAGE = 30;

type UseCoversListOptions = PosCoversQueryVariables & { posId?: string };

interface UseCoversListReturn {
  loading: boolean;
  error?: Error;
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
  const { posId, ...otherOptions } = options;
  const [{ pos, user, dateRange, sortField, sortDirection }] =
    useMultiQueryState<{
      pos: string;
      user: string;
      dateRange: string;
      sortField: string;
      sortDirection: string;
    }>(['pos', 'user', 'dateRange', 'sortField', 'sortDirection']);

  return {
    sortField: sortField || 'createdAt',
    sortDirection: sortDirection || '-1',
    perPage: COVERS_PER_PAGE,
    posId: posId !== undefined ? posId : pos || undefined,
    userId: user || undefined,
    startDate: parseDateRangeFromString(dateRange)?.from,
    endDate: parseDateRangeFromString(dateRange)?.to,
    ...otherOptions,
  };
};

export const useCoversList = (
  options: UseCoversListOptions = {},
): UseCoversListReturn => {
  const variables = useCoversVariables(options);
  const setPosCoverTotalCount = useSetAtom(posCoverTotalCountAtom);
  const setPosCoverTotalCountLoading = useSetAtom(
    posCoverTotalCountLoadingAtom,
  );
  const { data, loading, error, fetchMore } = useQuery(posCovers, {
    variables,
  });

  const transformedCoversList = useMemo(
    () =>
      data?.posCovers?.filter(hasId).map((cover) => ({
        _id: cover._id,
        posName: cover.posName,
        status: cover.status,
        beginDate: cover.beginDate,
        endDate: cover.endDate,
        description: cover.description,
        note: cover.note,
        createdAt: cover.createdAt,
        user: cover.user,
      })) || [],
    [data?.posCovers],
  );

  const totalCount = useMemo(
    () => readPosCount(data?.posCoversCount),
    [data?.posCoversCount],
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
        const existingIds = new Set(
          (prev.posCovers || []).map((cover) => cover?._id),
        );
        return {
          ...prev,
          posCovers: [
            ...(prev.posCovers || []),
            ...fetchMoreResult.posCovers.filter(
              (cover) => !existingIds.has(cover?._id),
            ),
          ],
          posCoversCount: fetchMoreResult.posCoversCount ?? prev.posCoversCount,
        };
      },
    });
  }, [transformedCoversList.length, fetchMore, data?.posCovers, variables]);

  useEffect(() => {
    setPosCoverTotalCount(data?.posCovers ? totalCount : null);
  }, [data?.posCovers, totalCount, setPosCoverTotalCount]);

  useEffect(() => {
    setPosCoverTotalCountLoading(loading);
  }, [loading, setPosCoverTotalCountLoading]);

  return {
    loading,
    error,
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
