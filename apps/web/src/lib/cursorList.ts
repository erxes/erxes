import type { CursorQuery, PageInfo } from '@erxes/core-contract';
import {
  type InfiniteData,
  type QueryClient,
  type QueryKey,
  keepPreviousData,
  type UseInfiniteQueryOptions,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { EnumCursorDirection } from 'erxes-ui';
import { tablePositionState } from 'erxes-ui/modules/record-table/states/RecordTableCursorState';
import { useStore } from 'jotai';
import { useEffect, useRef, useState } from 'react';

export interface CursorPage<T> {
  data: T[];
  pageInfo: PageInfo;
  /** Only on the page a list opened with: the pages loaded while scrolling don't count. */
  totalCount?: number;
  /** Big lists stop counting at `totalCount`: there are more. */
  totalCapped?: boolean;
}

export type CursorCache<T> = InfiniteData<CursorPage<T>, CursorQuery>;

/** What `useCursorList` adds to a list procedure's `infiniteOptions`. */
interface CursorPaging<T> {
  initialPageParam: CursorQuery;
  getNextPageParam: (last: CursorPage<T>) => CursorQuery | undefined;
  getPreviousPageParam: (first: CursorPage<T>) => CursorQuery | undefined;
}

/** The `getNextPageParam`s of lists that keep only their first page once nothing shows them. */
const firstPageOnLeave = new WeakSet<object>();

/**
 * Marks an infinite query's `getNextPageParam` so the list keeps only its first page once
 * nothing shows it (`keepFirstPageOnLeave`). Pass one function made once, not one per render.
 */
export const firstPageOnReturn = <F extends object>(getNextPageParam: F): F => {
  firstPageOnLeave.add(getNextPageParam);

  return getNextPageParam;
};

/**
 * Paging forward from the top, a page of `limit` at a time. Once nothing shows the list, it
 * keeps only its first page (`keepFirstPageOnLeave`), so coming back to it refetches one page,
 * not every page loaded; `keepPages` keeps them all, for a list that loads all its pages anyway.
 */
export const forwardPaging = (
  limit: number,
  { keepPages = false }: { keepPages?: boolean } = {},
): {
  initialPageParam: CursorQuery;
  getNextPageParam: (last: CursorPage<unknown>) => CursorQuery | undefined;
} => {
  const getNextPageParam = (last: CursorPage<unknown>): CursorQuery | undefined =>
    last.pageInfo.hasNextPage && last.pageInfo.endCursor
      ? { limit, cursor: last.pageInfo.endCursor, direction: 'forward', cursorMode: 'exclusive' }
      : undefined;

  if (!keepPages) firstPageOnReturn(getNextPageParam);

  return {
    initialPageParam: { limit, direction: 'forward', cursorMode: 'exclusive' },
    getNextPageParam,
  };
};

const isCursorCache = (data: unknown): data is CursorCache<unknown> =>
  typeof data === 'object' &&
  data !== null &&
  Array.isArray((data as Partial<CursorCache<unknown>>).pages) &&
  Array.isArray((data as Partial<CursorCache<unknown>>).pageParams);

/**
 * A paged list (`forwardPaging`, `useCursorList`) that nothing shows any more keeps only its
 * first page. TanStack refetches every page of an infinite query, one after another, when it
 * shows again with stale data; this way it refetches one, and the list loads the rest as it is
 * scrolled. A list that changed while hidden still refetches when it shows: the trim keeps the
 * data's age and its invalidation.
 */
export const keepFirstPageOnLeave = (client: QueryClient) =>
  client.getQueryCache().subscribe((event) => {
    if (event.type !== 'observerRemoved' && event.type !== 'updated') return;

    const { query } = event;
    const { options } = query;
    const data: unknown = query.state.data;
    const nextPageParam = 'getNextPageParam' in options ? options.getNextPageParam : undefined;

    if (
      query.getObserversCount() > 0 ||
      typeof nextPageParam !== 'function' ||
      !firstPageOnLeave.has(nextPageParam) ||
      !isCursorCache(data) ||
      data.pages.length < 2
    ) {
      return;
    }

    const { dataUpdatedAt, isInvalidated } = query.state;

    query.setData(
      { pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1) },
      { updatedAt: dataUpdatedAt, manual: true },
    );

    if (isInvalidated) query.invalidate();
  });

/** Keyset paging both ways, opening at row `from` (inclusive), or at the top. */
const cursorPaging = <T>(limit: number, from: string): CursorPaging<T> => {
  const forward = forwardPaging(limit);

  return {
    initialPageParam: from
      ? { limit, cursor: from, direction: 'forward', cursorMode: 'inclusive' }
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
  };
};

/**
 * When a list unmounts, the next visit opens at the row RecordTable remembered (`useCursorList`):
 * a query of its own, starting there. That query gets the rows this one holds from that row on,
 * one page of them, so the list shows at once and refetches that one page, and its position
 * becomes "that row at the top" (scroll 0), the place the new query's rows put it.
 */
const reopenAtRememberedRow = ({
  client,
  store,
  position,
  filtersKey,
  limit,
  from,
  to,
}: {
  client: QueryClient;
  store: ReturnType<typeof useStore>;
  position: ReturnType<typeof tablePositionState>;
  filtersKey: string;
  limit: number;
  from: QueryKey;
  /** The query key of the list opened at `row`. */
  to: (row: string) => QueryKey;
}) => {
  const saved = store.get(position);
  const cache = client.getQueryData<CursorCache<{ id: string }>>(from);

  if (!saved.row || saved.filters !== filtersKey || !cache?.pages.length) return;

  const rows = cache.pages.flatMap((page) => page.data);
  const index = rows.findIndex((row) => row.id === saved.row);

  if (index < 0) return;

  const data = rows.slice(index, index + limit);
  const counted = cache.pages.find((page) => page.totalCount !== undefined);
  const firstPage = cache.pages[0];
  const lastPage = cache.pages.at(-1);
  const key = to(saved.row);

  const page: CursorPage<{ id: string }> = {
    data,
    pageInfo: {
      hasPreviousPage: index > 0 || (firstPage?.pageInfo.hasPreviousPage ?? false),
      hasNextPage: index + limit < rows.length || (lastPage?.pageInfo.hasNextPage ?? false),
      startCursor: data[0]?.id ?? null,
      endCursor: data.at(-1)?.id ?? null,
    },
    ...(counted && { totalCount: counted.totalCount, totalCapped: counted.totalCapped }),
  };

  client.setQueryData<CursorCache<{ id: string }>>(
    key,
    {
      pages: [page],
      pageParams: [{ limit, cursor: saved.row, direction: 'forward', cursorMode: 'inclusive' }],
    },
    { updatedAt: client.getQueryState(from)?.dataUpdatedAt },
  );
  // Shown at once, but fetched again when the list mounts, whatever its staleTime.
  void client.invalidateQueries({ queryKey: key, exact: true, refetchType: 'none' });
  store.set(position, { ...saved, scroll: 0 });
};

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
  limit = 100,
  options,
}: {
  sessionKey: string;
  /** What the list is filtered by. */
  filters: object;
  limit?: number;
  options: (
    paging: CursorPaging<T>,
  ) => UseInfiniteQueryOptions<CursorPage<T>, Error, CursorCache<T>, QueryKey, CursorQuery>;
}) => {
  const filtersKey = JSON.stringify(filters);
  const store = useStore();
  const position = tablePositionState(sessionKey);

  // The row to reopen at: the one RecordTable remembered under these filters, else the top.
  const [opened, setOpened] = useState(() => {
    const saved = store.get(position);

    return { sessionKey, filtersKey, start: saved.filters === filtersKey ? saved.row : '' };
  });

  let { start } = opened;
  // New filters on the same list keep its rows until theirs arrive; another list starts blank.
  const sameList = opened.sessionKey === sessionKey;

  // Other filters (or another list) start from the top.
  if (opened.sessionKey !== sessionKey || opened.filtersKey !== filtersKey) {
    start = '';
    setOpened({ sessionKey, filtersKey, start });
  }

  // RecordTable's remembered row and scroll belong to the filters recorded with them.
  useEffect(() => {
    if (store.get(position).filters !== filtersKey) {
      store.set(position, { filters: filtersKey, row: '', rowOffset: 0, scroll: 0 });
    }
  }, [store, position, filtersKey]);

  const paging = (from: string) => cursorPaging<T>(limit, from);
  const queryOptions = options(paging(start));
  const client = useQueryClient();

  // What the list shows, for the cleanup below to read when it unmounts.
  const leaving = { client, store, position, filtersKey, limit, from: queryOptions.queryKey };
  const shown = useRef({ ...leaving, to: (row: string) => options(paging(row)).queryKey });

  useEffect(() => {
    shown.current = { ...leaving, to: (row: string) => options(paging(row)).queryKey };
  });

  // When the list unmounts, before the query's own cleanup (`keepFirstPageOnLeave`) keeps
  // only its first page.
  useEffect(() => {
    const latest = shown;

    return () => reopenAtRememberedRow(latest.current);
  }, []);

  const query = useInfiniteQuery({
    ...queryOptions,
    placeholderData: sameList ? keepPreviousData : undefined,
  });

  const pages = query.data?.pages ?? [];
  // The page the list opened with; pages loaded above it (scrolling back) have no count.
  const counted = pages.find((page) => page.totalCount !== undefined);

  const handleFetchMore = ({ direction }: { direction: EnumCursorDirection }) => {
    if (direction === EnumCursorDirection.FORWARD) {
      if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
    } else if (query.hasPreviousPage && !query.isFetchingPreviousPage) {
      void query.fetchPreviousPage();
    }
  };

  return {
    sessionKey,
    list: pages.flatMap((page) => page.data),
    totalCount: counted?.totalCount,
    totalCapped: counted?.totalCapped ?? false,
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

/**
 * A record from a list's cached pages, when the list holds the same shape its `get` returns:
 * what a side panel shows while it loads the record itself.
 * `recordInPages(client.getQueriesData<CursorCache<Customer>>({ queryKey: orpc.customers.list.key() }), id)`.
 */
export const recordInPages = <T extends { id: string }>(
  caches: [QueryKey, CursorCache<T> | undefined][],
  id: string,
): T | undefined => {
  for (const [, cache] of caches) {
    for (const page of cache?.pages ?? []) {
      const record = page.data.find((item) => item.id === id);

      if (record) return record;
    }
  }

  return undefined;
};

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
