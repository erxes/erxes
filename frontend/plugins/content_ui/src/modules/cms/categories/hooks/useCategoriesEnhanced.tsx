import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  parseDateRangeFromString,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { CMS_CATEGORIES } from '../graphql';
import { CATEGORIES_CURSOR_SESSION_KEY } from '../constants/categoriesCursorSessionKey';
import { useSetAtom } from 'jotai';
import { categoriesTotalCountAtom } from '../states/categoriesCounts';
import { useEffect } from 'react';

export const CATEGORIES_PER_PAGE = 30;

export const useCategoriesVariables = (
  variables?: QueryHookOptions<{
    cmsCategories: {
      list: any[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>['variables'],
) => {
  const [{ searchValue, status, createdAt, updatedAt }] = useMultiQueryState<{
    searchValue: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>(['searchValue', 'status', 'createdAt', 'updatedAt']);

  const { cursor } = useRecordTableCursor({
    sessionKey: CATEGORIES_CURSOR_SESSION_KEY,
  });

  return {
    limit: CATEGORIES_PER_PAGE,
    cursor,
    searchValue: searchValue || undefined,
    status: status && status !== 'all' ? status : undefined,
    dateFilters: {
      createdAt: {
        gte: parseDateRangeFromString(createdAt)?.from,
        lte: parseDateRangeFromString(createdAt)?.to,
      },
      updatedAt: {
        gte: parseDateRangeFromString(updatedAt)?.from,
        lte: parseDateRangeFromString(updatedAt)?.to,
      },
    },
    ...variables,
  };
};

export const useCategories = (options?: QueryHookOptions) => {
  const setCategoriesTotalCount = useSetAtom(categoriesTotalCountAtom);
  const variables = useCategoriesVariables(options?.variables);
  const { data, loading, fetchMore, refetch } = useQuery<{
    cmsCategories: {
      list: any[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(CMS_CATEGORIES, {
    ...options,
    variables: {
      ...options?.variables,
      ...variables,
    },
    fetchPolicy: 'cache-and-network',
  });

  const {
    list: categories = [],
    totalCount = 0,
    pageInfo,
  } = data?.cmsCategories || {};
  useEffect(() => {
    if (!totalCount) return;
    setCategoriesTotalCount(totalCount);
  }, [totalCount, setCategoriesTotalCount]);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (
      !validateFetchMore({
        direction,
        pageInfo,
      })
    ) {
      return;
    }

    fetchMore({
      variables: {
        ...variables,
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: CATEGORIES_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          cmsCategories: {
            list: [
              ...(prev.cmsCategories?.list || []),
              ...fetchMoreResult.cmsCategories.list,
            ],
            totalCount: fetchMoreResult.cmsCategories.totalCount,
            pageInfo: fetchMoreResult.cmsCategories.pageInfo,
          },
        });
      },
    });
  };

  return {
    loading,
    categories,
    totalCount,
    handleFetchMore,
    pageInfo,
    refetch,
  };
};