import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type UIEvent,
} from 'react';
import { useStore } from 'jotai';
import { useDebouncedCallback } from 'use-debounce';
import { ScrollArea } from 'erxes-ui/components/scroll-area';
import { mergeRefs } from 'erxes-ui/lib/utils';
import { useCursorScroll } from '../hooks/useCursorScroll';
import { tablePositionState } from '../states/RecordTableCursorState';
import { EnumCursorDirection } from '../types/RecordTableCursorTypes';
import { RecordTableRowSkeleton } from './RecordTableRowSkeleton';

interface CursorContext {
  /** The scrolling element, the root the load-more skeletons watch for. */
  viewport: HTMLDivElement | null;
  startBackwardFetch: () => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  loading?: boolean;
  /** Rows loaded: the forward skeleton asks for more each time it grows while in view. */
  dataLength?: number;
}

const RecordTableCursorContext = createContext<CursorContext | null>(null);

const useRecordTableCursorContext = () => {
  const context = useContext(RecordTableCursorContext);

  if (!context) {
    throw new Error('Cursor skeletons must be used within a RecordTableCursorProvider');
  }

  return context;
};

/** Where rows start to show in the scrolling element: under its sticky header. */
const rowsTop = (scroll: HTMLElement) =>
  scroll.getBoundingClientRect().top +
  (scroll.querySelector('thead')?.getBoundingClientRect().height ?? 0);

/** The drawn rows with a record's cursor or id, which skeleton and spacer rows lack. */
const recordRows = (scroll: HTMLElement) => [
  ...scroll.querySelectorAll<HTMLElement>('tbody > tr[id]'),
];

/** The first record row the header doesn't cover, and how many pixels of it are under it. */
const firstVisibleRow = (scroll: HTMLElement) => {
  const top = rowsTop(scroll);

  for (const row of recordRows(scroll)) {
    const box = row.getBoundingClientRect();

    if (box.bottom > top) return { row, offset: top - box.top };
  }

  return null;
};

/**
 * Scrolls a cursor-paged table. With a `sessionKey` it remembers the first visible row and the
 * scroll position for the session, and restores the position when the rows come back.
 */
export const RecordTableCursorProvider = ({
  children,
  hasPreviousPage,
  loading,
  dataLength,
  hasNextPage,
  sessionKey,
  offset = 102,
}: {
  children: ReactNode;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  loading?: boolean;
  dataLength?: number;
  sessionKey?: string;
  offset?: number;
}) => {
  const { scrollRef, startBackwardFetch } = useCursorScroll({
    dataLength,
    hasPreviousPage,
    offset,
  });

  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  // Read and written through the store, so scrolling re-renders nothing.
  const store = useStore();

  // Once the scrolling pauses, not on every scroll event: a scroll fires one per frame.
  const rememberPosition = useDebouncedCallback((scroll: HTMLDivElement) => {
    if (!sessionKey) return;
    const first = firstVisibleRow(scroll);

    store.set(tablePositionState(sessionKey), (saved) => ({
      ...saved,
      row: first?.row.id ?? '',
      rowOffset: first?.offset ?? 0,
      scroll: scroll.scrollTop,
    }));
  }, 150);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => rememberPosition(event.currentTarget);

  // The list it last restored: once its rows are in, the position is the member's, so a page
  // that loads while they scroll leaves it where it is.
  const restoredFor = useRef<string | null>(null);

  useEffect(() => {
    const scroll = scrollRef.current;

    if (!dataLength || loading || !scroll || !sessionKey || restoredFor.current === sessionKey) {
      return;
    }

    restoredFor.current = sessionKey;

    const saved = store.get(tablePositionState(sessionKey));
    const row = recordRows(scroll).find((element) => saved.row && element.id === saved.row);

    // The list may reopen at the remembered row rather than at the top, so the row places it;
    // the offset does when the row isn't drawn.
    if (row) {
      scroll.scrollTop += row.getBoundingClientRect().top - rowsTop(scroll) + saved.rowOffset;
    } else if (saved.scroll) {
      scroll.scrollTop = saved.scroll;
    }
  }, [loading, dataLength, scrollRef, sessionKey, store]);

  const cursor = useMemo(
    () => ({ viewport, startBackwardFetch, hasNextPage, hasPreviousPage, loading, dataLength }),
    [viewport, startBackwardFetch, hasNextPage, hasPreviousPage, loading, dataLength],
  );

  return (
    <RecordTableCursorContext.Provider value={cursor}>
      <ScrollArea.Root className="h-full w-full pb-2 pr-2 relative">
        <ScrollArea.Viewport ref={mergeRefs(scrollRef, setViewport)} onScroll={handleScroll}>
          <div className="min-h-table">{children}</div>
        </ScrollArea.Viewport>

        <ScrollArea.Bar orientation="vertical" />
        <ScrollArea.Bar orientation="horizontal" />
      </ScrollArea.Root>
    </RecordTableCursorContext.Provider>
  );
};

type FetchMore = (params: { direction: EnumCursorDirection }) => void;

export const RecordTableBackwardSkeleton = ({
  handleFetchMore,
}: {
  handleFetchMore: FetchMore;
}) => {
  const { viewport, startBackwardFetch, hasPreviousPage, loading } = useRecordTableCursorContext();

  if (!hasPreviousPage || loading) return null;

  return (
    <RecordTableRowSkeleton
      rows={3}
      backward
      root={viewport}
      handleInView={() => {
        startBackwardFetch();
        handleFetchMore({ direction: EnumCursorDirection.BACKWARD });
      }}
    />
  );
};

export const RecordTableForwardSkeleton = ({ handleFetchMore }: { handleFetchMore: FetchMore }) => {
  const { hasNextPage, loading, viewport, dataLength } = useRecordTableCursorContext();

  if (!hasNextPage || loading) return null;

  return (
    <RecordTableRowSkeleton
      rows={1}
      root={viewport}
      loaded={dataLength}
      handleInView={() => handleFetchMore({ direction: EnumCursorDirection.FORWARD })}
    />
  );
};
