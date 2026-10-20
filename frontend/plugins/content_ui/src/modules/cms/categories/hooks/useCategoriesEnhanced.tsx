import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  useMultiQueryState,
  validateFetchMore,
} from 'erxes-ui';
import type {
  CategoryStatus,
  CmsCategoriesQuery,
  CmsCategoriesQueryVariables,
} from '~/gql/graphql';
import { CMS_CATEGORIES } from '../graphql';
import { useAtomValue, useSetAtom } from 'jotai';
import { categoriesTotalCountAtom } from '../states/categoriesCounts';
import { useEffect, useMemo } from 'react';
import { cmsLanguageAtom } from '../../shared/states/cmsLanguageState';
import {
  compactList,
  mergeCursorPage,
  toCursorPageInfo,
} from '../../shared/utils';

export const CATEGORIES_PER_PAGE = 30;

const CATEGORY_STATUSES: readonly CategoryStatus[] = ['active', 'inactive'];

const toCategoryStatus = (value?: string | null) =>
  CATEGORY_STATUSES.find((categoryStatus) => categoryStatus === value);

export const useCategoriesVariables = (
  variables: CmsCategoriesQueryVariables,
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
    status: toCategoryStatus(status),
    ...variables,
  };
};

export const useCategories = (
  options: QueryHookOptions<CmsCategoriesQuery, CmsCategoriesQueryVariables> & {
    variables: CmsCategoriesQueryVariables;
  },
) => {
  const setCategoriesTotalCount = useSetAtom(categoriesTotalCountAtom);
  const variables = useCategoriesVariables(options.variables);
  const { data, loading, fetchMore, refetch } = useQuery(CMS_CATEGORIES, {
    ...options,
    variables,
    fetchPolicy: 'network-only',
  });

  const categories = useMemo(
    () => compactList(data?.cmsCategories?.list),
    [data?.cmsCategories?.list],
  );
  const pageInfo = useMemo(
    () => toCursorPageInfo(data?.cmsCategories?.pageInfo),
    [data?.cmsCategories?.pageInfo],
  );
  const totalCount = data?.cmsCategories?.totalCount;

  useEffect(() => {
    setCategoriesTotalCount(totalCount ?? null);
    return () => {
      setCategoriesTotalCount(null);
    };
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
        if (!fetchMoreResult.cmsCategories || !prev.cmsCategories) return prev;

        const merged = mergeCursorPage(
          direction,
          prev.cmsCategories,
          fetchMoreResult.cmsCategories,
        );

        return {
          ...prev,
          cmsCategories: {
            ...fetchMoreResult.cmsCategories,
            list: merged.list,
            pageInfo: merged.pageInfo,
          },
        };
      },
    });
  };

  return {
    loading,
    categories,
    totalCount: totalCount ?? 0,
    handleFetchMore,
    pageInfo,
    refetch,
  };
};
