import type { PageInfo } from '@erxes/core-contract';
import {
  type InfiniteData,
  type QueryClient,
  type QueryKey,
  type UseInfiniteQueryOptions,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { EnumCursorDirection } from 'erxes-ui';
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

type CursorCache<T> = InfiniteData<CursorPage<T>, CursorParams>;

/** What `useCursorList` adds to a list procedure's `infiniteOptions`. */
interface CursorPaging<T> {
  initialPageParam: CursorParams;
  getNextPageParam: (last: CursorPage<T>) => CursorParams | undefined;
  getPreviousPageParam: (first: CursorPage<T>) => CursorParams | undefined;
}

/** Paging forward from the top, a page of `limit` at a time. */
export const forwardPaging = (
  limit: number,
): {
  initialPageParam: CursorParams;
  getNextPageParam: (last: CursorPage<unknown>) => CursorParams | undefined;
} => ({
  initialPageParam: { limit, direction: 'forward', cursorMode: 'exclusive' },
  getNextPageParam: (last: CursorPage<unknown>): CursorParams | undefined =>
    last.pageInfo.hasNextPage && last.pageInfo.endCursor
      ? { limit, cursor: last.pageInfo.endCursor, direction: 'forward', cursorMode: 'exclusive' }
      : undefined,
});

/** The row to reopen at: the one RecordTable remembered under these filters, else the top. */
const rememberedStart = (sessionKey: string, filters: string) =>
  sessionStorage.getItem(`${sessionKey}_filters`) === filters
    ? (sessionStorage.getItem(sessionKey) ?? '')
    : '';

/**
 * A keyset-paged core list for `RecordTable.CursorProvider`: loads forward and
 * backward as the table scrolls, and reopens at the row the user last saw
 * (RecordTable remembers it per `sessionKey`). The remembered row belongs to
 * one set of filters: when the filters differ, the list starts from the top.
 *
 * `options` turns the paging into the procedure's options:
 * `(paging) => orpc.customers.list.infiniteOptions({ input: (page) => ({ ...page, ...filters }), ...paging })`.
 */
export const useCursorList = <T extends { id: string }>({
  sessionKey,
  filters,
  limit = 30,
  options,
}: {
  sessionKey: string;
  /** What the list is filtered by. */
  filters: object;
  limit?: number;
  options: (
    paging: CursorPaging<T>,
  ) => UseInfiniteQueryOptions<CursorPage<T>, Error, CursorCache<T>, QueryKey, CursorParams>;
}) => {
  const filtersKey = JSON.stringify(filters);

  const [opened, setOpened] = useState(() => ({
    sessionKey,
    filtersKey,
    start: rememberedStart(sessionKey, filtersKey),
  }));

  let { start } = opened;

  // Other filters (or another list) start from the top.
  if (opened.sessionKey !== sessionKey || opened.filtersKey !== filtersKey) {
    start = '';
    setOpened({ sessionKey, filtersKey, start });
  }

  // RecordTable's remembered row and scroll belong to the filters recorded with them.
  useEffect(() => {
    const recorded = `${sessionKey}_filters`;

    if (sessionStorage.getItem(recorded) !== filtersKey) {
      sessionStorage.removeItem(sessionKey);
      sessionStorage.removeItem(`${sessionKey}_scroll`);
      sessionStorage.setItem(recorded, filtersKey);
    }
  }, [sessionKey, filtersKey]);

  const forward = forwardPaging(limit);

  const query = useInfiniteQuery(
    options({
      initialPageParam: start
        ? { limit, cursor: start, direction: 'forward', cursorMode: 'inclusive' }
        : forward.initialPageParam,
      getNextPageParam: forward.getNextPageParam,
      getPreviousPageParam: (first) =>
        first.pageInfo.hasPreviousPage && first.pageInfo.startCursor
          ? {
              limit,
              cursor: first.pageInfo.startCursor,
              direction: 'backward',
              cursorMode: 'exclusive',
            }
          : undefined,
    }),
  );

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
    loading: query.isPending,
    error: query.error,
    handleFetchMore,
  };
};

/** Replaces a record wherever the cached pages of a list (`orpc.<group>.list.key()`) hold it. */
export const patchCachedRecord = <T extends { id: string }>(
  client: QueryClient,
  listKey: QueryKey,
  record: T,
) =>
  client.setQueriesData<CursorCache<T>>({ queryKey: listKey }, (cache) =>
    cache?.pages
      ? {
          ...cache,
          pages: cache.pages.map((page) => ({
            ...page,
            data: page.data.map((item) => (item.id === record.id ? record : item)),
          })),
        }
      : cache,
  );

/** Drops records from the cached pages of a list (`orpc.<group>.list.key()`). */
export const removeCachedRecords = (client: QueryClient, listKey: QueryKey, ids: string[]) =>
  client.setQueriesData<CursorCache<{ id: string }>>({ queryKey: listKey }, (cache) =>
    cache?.pages
      ? {
          ...cache,
          pages: cache.pages.map((page) => ({
            ...page,
            data: page.data.filter((item) => !ids.includes(item.id)),
          })),
        }
      : cache,
  );
