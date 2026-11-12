import type { PageInfo } from '@erxes/core-contract';
import {
  type InfiniteData,
  type QueryClient,
  type QueryKey,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { EnumCursorDirection, useRecordTableCursor } from 'erxes-ui';
import { useEffect, useState } from 'react';

export interface CursorPage<T> {
  data: T[];
  pageInfo: PageInfo;
  totalCount: number;
  /** Big lists stop counting at `totalCount`: there are more. */
  totalCapped?: boolean;
}

/** A list's total as people read it: 1,234 or, when counting stopped, 10,000+. */
export const formatTotal = (totalCount: number, capped?: boolean) =>
  `${totalCount.toLocaleString('en')}${capped ? '+' : ''}`;

export interface CursorParams {
  limit: number;
  cursor?: string;
  direction: 'forward' | 'backward';
  cursorMode: 'inclusive' | 'exclusive';
}

/**
 * A keyset-paged core list for `RecordTable.CursorProvider`: loads forward and
 * backward as the table scrolls, and reopens at the row the user last saw
 * (RecordTable remembers it per `sessionKey`). The remembered row belongs to
 * one set of filters: when the filters differ, the list starts from the top,
 * whichever filter changed them (search, tags, owner, …).
 */
export const useCursorList = <T extends { id: string }>({
  queryKey,
  sessionKey,
  limit = 30,
  fetchPage,
}: {
  queryKey: QueryKey;
  sessionKey: string;
  limit?: number;
  fetchPage: (params: CursorParams) => Promise<CursorPage<T>>;
}) => {
  const { cursor, setCursor } = useRecordTableCursor({ sessionKey });
  // The remembered cursor is restored in an effect; wait one render for it.
  const [ready, setReady] = useState(false);
  const filters = JSON.stringify(queryKey);

  // Runs after useRecordTableCursor restored the remembered row: forget it if
  // it was remembered under other filters, then record the current ones.
  useEffect(() => {
    const filtersKey = `${sessionKey}_filters`;
    const remembered = sessionStorage.getItem(filtersKey);

    // Unknown filters (nothing recorded, e.g. remembered by an older build) count as different.
    if (remembered !== filters) {
      sessionStorage.removeItem(sessionKey);
      sessionStorage.removeItem(`${sessionKey}_scroll`);
      setCursor('');
    }

    sessionStorage.setItem(filtersKey, filters);
    setReady(true);
  }, [sessionKey, filters, setCursor]);

  const query = useInfiniteQuery({
    queryKey: [...queryKey, { limit, start: cursor || null }],
    enabled: ready,
    initialPageParam: cursor
      ? { limit, cursor, direction: 'forward', cursorMode: 'inclusive' }
      : { limit, direction: 'forward', cursorMode: 'exclusive' },
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    getNextPageParam: (last): CursorParams | undefined =>
      last.pageInfo.hasNextPage && last.pageInfo.endCursor
        ? { limit, cursor: last.pageInfo.endCursor, direction: 'forward', cursorMode: 'exclusive' }
        : undefined,
    getPreviousPageParam: (first): CursorParams | undefined =>
      first.pageInfo.hasPreviousPage && first.pageInfo.startCursor
        ? {
            limit,
            cursor: first.pageInfo.startCursor,
            direction: 'backward',
            cursorMode: 'exclusive',
          }
        : undefined,
  });

  const pages = query.data?.pages ?? [];

  const handleFetchMore = ({ direction }: { direction: EnumCursorDirection }) => {
    if (direction === EnumCursorDirection.FORWARD) {
      if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
    } else if (query.hasPreviousPage && !query.isFetchingPreviousPage) {
      void query.fetchPreviousPage();
    }
  };

  return {
    list: pages.flatMap((page) => page.data),
    totalCount: pages[0]?.totalCount,
    totalCapped: pages[0]?.totalCapped ?? false,
    hasNextPage: query.hasNextPage,
    hasPreviousPage: query.hasPreviousPage,
    loading: !ready || query.isPending,
    error: query.error,
    handleFetchMore,
  };
};

type ListCache<T> = InfiniteData<CursorPage<T>, CursorParams>;

/** Other queries share the key prefix (a detail, a related list); only paged lists are patched. */
const isList = <T>(cache: unknown): cache is ListCache<T> =>
  !!cache && Array.isArray((cache as { pages?: unknown }).pages);

/** Replaces a record wherever cached lists under `queryKey` hold it. */
export const patchCachedRecord = <T extends { id: string }>(
  client: QueryClient,
  queryKey: QueryKey,
  record: T,
) =>
  client.setQueriesData<unknown>({ queryKey }, (cache: unknown) =>
    isList<T>(cache)
      ? {
          ...cache,
          pages: cache.pages.map((page) => ({
            ...page,
            data: page.data.map((item) => (item.id === record.id ? record : item)),
          })),
        }
      : cache,
  );

/** Drops records from cached lists under `queryKey`. */
export const removeCachedRecords = <T extends { id: string }>(
  client: QueryClient,
  queryKey: QueryKey,
  ids: string[],
) =>
  client.setQueriesData<unknown>({ queryKey }, (cache: unknown) =>
    isList<T>(cache)
      ? {
          ...cache,
          pages: cache.pages.map((page) => ({
            ...page,
            data: page.data.filter((item) => !ids.includes(item.id)),
          })),
        }
      : cache,
  );
