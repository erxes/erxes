import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { GET_DEALS_SEARCH_DROPDOWN } from '../graphql/queries/DealsQueries';
import { IDealList } from '../types/deals';

const DEALS_PER_PAGE = 10;

type CursorDirection = 'forward' | 'backward';

type DealSearchResponse = {
  deals: IDealList & {
    totalCount: number;
    pageInfo?: {
      startCursor?: string;
      endCursor?: string;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};

export const useDealSearch = (search: string) => {
  const [cursor, setCursor] = useState<string>();
  const [direction, setDirection] = useState<CursorDirection>('forward');
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setCursor(undefined);
    setDirection('forward');
    setPageIndex(0);
  }, [search]);

  const { data, loading } = useQuery<DealSearchResponse>(
    GET_DEALS_SEARCH_DROPDOWN,
    {
      variables: {
        search,
        noSkipArchive: true,
        limit: DEALS_PER_PAGE,
        cursor,
        direction,
        orderBy: { modifiedAt: -1 },
      },
      skip: search.length < 2,
      fetchPolicy: 'cache-and-network',
    },
  );

  const { list: deals = [], pageInfo, totalCount = 0 } = data?.deals || {};

  const goToNextPage = () => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor || loading) {
      return;
    }
    setCursor(pageInfo.endCursor);
    setDirection('forward');
    setPageIndex((currentPage) => currentPage + 1);
  };
  const goToPreviousPage = () => {
    if (!pageInfo?.hasPreviousPage || !pageInfo?.startCursor || loading) {
      return;
    }
    setCursor(pageInfo.startCursor);
    setDirection('backward');
    setPageIndex((currentPage) => currentPage - 1);
  };

  return {
    deals,
    loading,
    totalCount,
    pageInfo,
    pageIndex,
    cursor,
    direction,
    pageSize: DEALS_PER_PAGE,
    goToNextPage,
    goToPreviousPage,
  };
};
