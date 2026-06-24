import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  useMultiQueryState,
  validateFetchMore,
} from 'erxes-ui';
import { CMS_CATEGORIES } from '../graphql';
import { useAtomValue, useSetAtom } from 'jotai';
import { categoriesTotalCountAtom } from '../states/categoriesCounts';
import { useEffect } from 'react';
import { cmsLanguageAtom } from '../../shared/states/cmsLanguageState';
import { ICategory } from '../types';

interface CategoriesQueryResult {
  cmsCategories?: {
    list?: ICategory[];
    totalCount?: number;
    pageInfo?: IRecordTableCursorPageInfo;
  };
}

export const CATEGORIES_PER_PAGE = 30;

export const useCategoriesVariables = (
  variables?: QueryHookOptions<CategoriesQueryResult>['variables'],
) => {
  const language = useAtomValue(cmsLanguageAtom);
  const [{ searchValue, status }] = useMultiQueryState<{
    searchValue: string;
    status: string;
  }>(['searchValue', 'status']);

  return {
    limit: CATEGORIES_PER_PAGE,
    cursor: undefined,
    sortField: 'createdAt',
    sortDirection: 'asc',
    language,
    searchValue: searchValue || undefined,
    status: status || undefined,
    ...variables,
  };
};

export const useCategories = (options?: QueryHookOptions) => {
  const setCategoriesTotalCount = useSetAtom(categoriesTotalCountAtom);
  const variables = useCategoriesVariables(options?.variables);
  const { data, loading, fetchMore, refetch } = useQuery<CategoriesQueryResult>(
    CMS_CATEGORIES,
    {
      ...options,
      variables: {
        ...options?.variables,
        ...variables,
      },
      fetchPolicy: 'network-only',
    },
  );

  const {
    list: categories = [],
    totalCount,
    pageInfo,
  } = data?.cmsCategories || {};
  const safeTotalCount = totalCount ?? 0;
  useEffect(() => {
    setCategoriesTotalCount(totalCount ?? null);
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
    totalCount: safeTotalCount,
    handleFetchMore,
    pageInfo,
    refetch,
  };
};
