// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query';
import { EnumCursorDirection } from 'erxes-ui';
import { tablePositionState } from 'erxes-ui/modules/record-table/states/RecordTableCursorState';
import { getDefaultStore } from 'jotai';
import { act, createElement, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vite-plus/test';
import {
  type CursorPage,
  type CursorParams,
  firstPageOnReturn,
  forwardPaging,
  keepFirstPageOnLeave,
  useCursorList,
} from '../cursorList';

type Row = { id: string; name: string };

/** A keyset list of 1000 rows, newest first, as core pages it; renaming one shows on refetch. */
let rows: Row[] = [];
const requests: CursorParams[] = [];

const serve = (params: CursorParams): CursorPage<Row> => {
  requests.push(params);

  const at = params.cursor ? rows.findIndex((row) => row.id === params.cursor) : -1;
  const from = !params.cursor ? 0 : params.cursorMode === 'inclusive' ? at : at + 1;
  const data = rows.slice(from, from + params.limit);

  return {
    data,
    pageInfo: {
      hasNextPage: from + params.limit < rows.length,
      hasPreviousPage: from > 0,
      startCursor: data[0]?.id ?? null,
      endCursor: data.at(-1)?.id ?? null,
    },
    ...(from === at || !params.cursor ? { totalCount: rows.length } : {}),
  };
};

const SESSION = 'cursor-list-test';
const store = getDefaultStore();

/** What the lists rendered last, written once each render commits. */
const seen: {
  cursor: ReturnType<typeof useCursorList<Row>> | null;
  forward: { rows: number; fetchNextPage: () => void } | null;
} = { cursor: null, forward: null };

/** A table's list: `useCursorList`, keyed like orpc's `infiniteOptions` by its opening page. */
const CursorList = () => {
  const list = useCursorList<Row>({
    sessionKey: SESSION,
    filters: {},
    options: (paging) => ({
      queryKey: ['rows', 'cursor', paging.initialPageParam],
      queryFn: async ({ pageParam }) => serve(pageParam),
      ...paging,
    }),
  });

  useEffect(() => {
    seen.cursor = list;
  });

  return null;
};

/** A list that pages forward only (notifications, a board's column). */
const ForwardList = ({ keepPages = false }: { keepPages?: boolean }) => {
  const query = useInfiniteQuery({
    queryKey: ['rows', 'forward', keepPages],
    queryFn: async ({ pageParam }: { pageParam: CursorParams }) => serve(pageParam),
    ...forwardPaging(100, { keepPages }),
  });

  useEffect(() => {
    seen.forward = {
      rows: query.data?.pages.flatMap((page) => page.data).length ?? 0,
      fetchNextPage: () => void query.fetchNextPage(),
    };
  });

  return null;
};

/** The cursor after a page, made once: what a timeline pages with. */
const nextByCursor = firstPageOnReturn((last: CursorPage<Row>) =>
  last.pageInfo.hasNextPage ? (last.pageInfo.endCursor ?? undefined) : undefined,
);

/** A list with paging of its own, by a bare cursor (a record's timeline). */
const TimelineList = () => {
  const query = useInfiniteQuery({
    queryKey: ['rows', 'timeline'],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) =>
      serve({ limit: 100, cursor: pageParam, direction: 'forward', cursorMode: 'exclusive' }),
    initialPageParam: undefined,
    getNextPageParam: nextByCursor,
  });

  useEffect(() => {
    seen.forward = {
      rows: query.data?.pages.flatMap((page) => page.data).length ?? 0,
      fetchNextPage: () => void query.fetchNextPage(),
    };
  });

  return null;
};

const settle = () =>
  act(
    () =>
      new Promise((resolve) => {
        setTimeout(resolve, 20);
      }),
  );

let client = new QueryClient();
let root: Root | null = null;

const show = (element: ReturnType<typeof createElement>) => {
  const container = document.createElement('div');

  document.body.append(container);
  root = createRoot(container);
  act(() => root?.render(createElement(QueryClientProvider, { client }, element)));
};

const leave = () => {
  act(() => root?.unmount());
  root = null;
};

describe('paged lists shown again', () => {
  beforeAll(() => {
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
  });

  beforeEach(() => {
    rows = Array.from({ length: 1000 }, (_, index) => ({ id: `r${index}`, name: `Row ${index}` }));
    requests.length = 0;
    client = new QueryClient();
    keepFirstPageOnLeave(client);
    store.set(tablePositionState(SESSION), { filters: '', row: '', rowOffset: 0, scroll: 0 });
  });

  afterEach(() => {
    leave();
    client.clear();
  });

  it('refetches one page of a forward list, not every page it had loaded', async () => {
    show(createElement(ForwardList));
    await settle();

    for (let page = 0; page < 4; page += 1) {
      act(() => seen.forward?.fetchNextPage());
      await settle();
    }

    expect(seen.forward?.rows).toBe(500);

    leave();
    requests.length = 0;
    show(createElement(ForwardList));

    // The first page shows at once, then that page alone is fetched again.
    expect(seen.forward?.rows).toBe(100);
    await settle();
    expect(requests).toHaveLength(1);
    expect(requests[0]?.cursor).toBeUndefined();
  });

  it('refetches one page of a list with paging of its own, marked by firstPageOnReturn', async () => {
    show(createElement(TimelineList));
    await settle();

    for (let page = 0; page < 2; page += 1) {
      act(() => seen.forward?.fetchNextPage());
      await settle();
    }

    expect(seen.forward?.rows).toBe(300);

    leave();
    requests.length = 0;
    show(createElement(TimelineList));

    expect(seen.forward?.rows).toBe(100);
    await settle();
    expect(requests).toHaveLength(1);
  });

  it('keeps every page of a list that asks to', async () => {
    show(createElement(ForwardList, { keepPages: true }));
    await settle();
    act(() => seen.forward?.fetchNextPage());
    await settle();

    leave();
    requests.length = 0;
    show(createElement(ForwardList, { keepPages: true }));

    expect(seen.forward?.rows).toBe(200);
    await settle();
    expect(requests).toHaveLength(2);
  });

  it('reopens a table at its remembered row from the cache, fetching that page alone', async () => {
    show(createElement(CursorList));
    await settle();

    for (let page = 0; page < 3; page += 1) {
      act(() => seen.cursor?.handleFetchMore({ direction: EnumCursorDirection.FORWARD }));
      await settle();
    }

    expect(seen.cursor?.list).toHaveLength(400);

    // RecordTable remembers the first row in view and the scroll offset.
    store.set(tablePositionState(SESSION), {
      filters: '{}',
      row: 'r250',
      rowOffset: 12,
      scroll: 8250,
    });
    leave();
    requests.length = 0;
    rows[260] = { id: 'r260', name: 'Renamed while away' };

    show(createElement(CursorList));

    // At once: a page from the remembered row, with the list's count, at the top of the table.
    expect(seen.cursor?.loading).toBe(false);
    expect(seen.cursor?.list[0]?.id).toBe('r250');
    expect(seen.cursor?.list).toHaveLength(100);
    expect(seen.cursor?.totalCount).toBe(1000);
    expect(seen.cursor?.hasPreviousPage).toBe(true);
    expect(store.get(tablePositionState(SESSION))).toEqual({
      filters: '{}',
      row: 'r250',
      rowOffset: 12,
      scroll: 0,
    });

    // Then that one page comes again, with what changed while the list was away.
    await settle();
    expect(requests).toEqual([
      { limit: 100, cursor: 'r250', direction: 'forward', cursorMode: 'inclusive' },
    ]);
    expect(seen.cursor?.list.find((row) => row.id === 'r260')?.name).toBe('Renamed while away');
  });

  it('still shows a change made while the list was away, whatever its staleTime', async () => {
    show(createElement(ForwardList));
    await settle();
    act(() => seen.forward?.fetchNextPage());
    await settle();
    leave();

    // A live signal while nothing shows the list only marks it.
    await client.invalidateQueries({ queryKey: ['rows'] });
    client.setQueryDefaults(['rows'], { staleTime: 60_000 });
    requests.length = 0;

    show(createElement(ForwardList));
    await settle();
    expect(requests).toHaveLength(1);
  });
});
