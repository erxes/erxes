import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { PAGE_LIST } from '../graphql/queries/pagesListQueries';
import { PAGES_CURSOR_SESSION_KEY } from '../constants/pagesCursorSessionKey';
import { IPage } from '../types/pageTypes';
import { useSetAtom, useAtomValue } from 'jotai';
import { pagesTotalCountAtom } from '../states/pagesCounts';
import { cmsLanguageAtom } from '../../shared/states/cmsLanguageState';
import { useEffect } from 'react';

export const PAGES_PER_PAGE = 30;

export const usePagesVariables = (
  variables?: QueryHookOptions<{
    cmsPageList: {
      pages: IPage[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>['variables'],
) => {
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

export const usePages = (options?: QueryHookOptions) => {
  const setPagesTotalCount = useSetAtom(pagesTotalCountAtom);
  const variables = usePagesVariables(options?.variables);
  const { data, loading, fetchMore, refetch } = useQuery<{
    cmsPageList: {
      pages: IPage[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(PAGE_LIST, {
    ...options,
    variables: {
      ...options?.variables,
      ...variables,
    },
    fetchPolicy: 'network-only',
  });

  const { pages = [], totalCount, pageInfo } = data?.cmsPageList || {};
  const safeTotalCount = totalCount ?? 0;
  useEffect(() => {
    setPagesTotalCount(totalCount ?? null);
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
        if (!fetchMoreResult) return prev;

        const isForward = direction === EnumCursorDirection.FORWARD;
        const fetchPageInfo = fetchMoreResult.cmsPageList?.pageInfo || {};
        const prevPageInfo = prev.cmsPageList?.pageInfo || {};
        const fetchPages = fetchMoreResult.cmsPageList?.pages || [];
        const prevPages = prev.cmsPageList?.pages || [];

        return Object.assign({}, prev, {
          cmsPageList: {
            ...fetchMoreResult.cmsPageList,
            pages: isForward
              ? [...prevPages, ...fetchPages]
              : [...fetchPages, ...prevPages],
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
    pages,
    totalCount: safeTotalCount,
    handleFetchMore,
    pageInfo,
    refetch,
  };
};
