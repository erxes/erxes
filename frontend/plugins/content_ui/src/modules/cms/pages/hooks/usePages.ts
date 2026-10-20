import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import type { PageListQuery, PageListQueryVariables } from '~/gql/graphql';
import { PAGE_LIST } from '../graphql/queries/pagesListQueries';
import { PAGES_CURSOR_SESSION_KEY } from '../constants/pagesCursorSessionKey';
import { useSetAtom, useAtomValue } from 'jotai';
import { pagesTotalCountAtom } from '../states/pagesCounts';
import { cmsLanguageAtom } from '../../shared/states/cmsLanguageState';
import {
  compactList,
  mergeCursorPage,
  toCursorPageInfo,
} from '../../shared/utils';
import { useEffect, useMemo } from 'react';

export const PAGES_PER_PAGE = 30;

export const usePagesVariables = (variables: PageListQueryVariables) => {
  const [{ searchValue }] = useMultiQueryState<{ searchValue: string }>([
    'searchValue',
  ]);

  const language = useAtomValue(cmsLanguageAtom);

  const { cursor } = useRecordTableCursor({
    sessionKey: PAGES_CURSOR_SESSION_KEY,
  });

  return {
    limit: PAGES_PER_PAGE,
    cursor,
    language,
    searchValue: searchValue || undefined,
    ...variables,
  };
};

export const usePages = (
  options: QueryHookOptions<PageListQuery, PageListQueryVariables> & {
    variables: PageListQueryVariables;
  },
) => {
  const setPagesTotalCount = useSetAtom(pagesTotalCountAtom);
  const variables = usePagesVariables(options.variables);
  const { data, loading, fetchMore, refetch } = useQuery(PAGE_LIST, {
    ...options,
    variables,
    fetchPolicy: 'network-only',
  });

  const pages = useMemo(
    () => compactList(data?.cmsPageList?.pages),
    [data?.cmsPageList?.pages],
  );
  const pageInfo = useMemo(
    () => toCursorPageInfo(data?.cmsPageList?.pageInfo),
    [data?.cmsPageList?.pageInfo],
  );
  const totalCount = data?.cmsPageList?.totalCount;
  const safeTotalCount = totalCount ?? 0;
  useEffect(() => {
    setPagesTotalCount(totalCount ?? null);
    return () => {
      setPagesTotalCount(null);
    };
  }, [totalCount, setPagesTotalCount]);

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
        limit: PAGES_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.cmsPageList || !prev.cmsPageList) return prev;

        const merged = mergeCursorPage(
          direction,
          {
            list: prev.cmsPageList.pages,
            pageInfo: prev.cmsPageList.pageInfo,
          },
          {
            list: fetchMoreResult.cmsPageList.pages,
            pageInfo: fetchMoreResult.cmsPageList.pageInfo,
          },
        );

        return {
          ...prev,
          cmsPageList: {
            ...fetchMoreResult.cmsPageList,
            pages: merged.list,
            pageInfo: merged.pageInfo,
          },
        };
      },
    });
  };

  return {
    loading,
    pages,
    totalCount: safeTotalCount,
    handleFetchMore,
    pageInfo,
    refetch,
  };
};
