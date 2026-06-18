import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  parseDateRangeFromString,
  useMultiQueryState,
  validateFetchMore,
} from 'erxes-ui';
import { CMS_CATEGORIES } from '../graphql';
import { useAtomValue, useSetAtom } from 'jotai';
import { categoriesTotalCountAtom } from '../states/categoriesCounts';
import { useEffect } from 'react';
import { cmsLanguageAtom } from '../../shared/states/cmsLanguageState';

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
  const language = useAtomValue(cmsLanguageAtom);
  const [{ searchValue, status, createdAt, updatedAt }] = useMultiQueryState<{
    searchValue: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>(['searchValue', 'status', 'createdAt', 'updatedAt']);

  return {
    limit: CATEGORIES_PER_PAGE,
    cursor: undefined,
    sortField: 'createdAt',
    sortDirection: 'asc',
    language,
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
    fetchPolicy: 'network-only',
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
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: CATEGORIES_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        const isForward = direction === EnumCursorDirection.FORWARD;
        const fetchPageInfo = fetchMoreResult.cmsCategories?.pageInfo || {};
        const prevPageInfo = prev.cmsCategories?.pageInfo || {};
        const fetchList = fetchMoreResult.cmsCategories?.list || [];
        const prevList = prev.cmsCategories?.list || [];

        return Object.assign({}, prev, {
          cmsCategories: {
            ...fetchMoreResult.cmsCategories,
            list: isForward
              ? [...prevList, ...fetchList]
              : [...fetchList, ...prevList],
            pageInfo: {
              endCursor: isForward
                ? fetchPageInfo.endCursor
                : prevPageInfo.endCursor,
              hasNextPage: isForward
                ? fetchPageInfo.hasNextPage
                : prevPageInfo.hasNextPage,
              hasPreviousPage: isForward
                ? prevPageInfo.hasPreviousPage
                : fetchPageInfo.hasPreviousPage,
              startCursor: isForward
                ? prevPageInfo.startCursor
                : fetchPageInfo.startCursor,
            },
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
