import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type UIEvent,
} from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ScrollArea } from 'erxes-ui/components/scroll-area';
import { mergeRefs } from 'erxes-ui/lib/utils';
import { useCursorScroll } from '../hooks/useCursorScroll';
import { EnumCursorDirection } from '../types/RecordTableCursorTypes';
import { RecordTableRowSkeleton } from './RecordTableRowSkeleton';

interface CursorContext {
  /** The scrolling element, the root the load-more skeletons watch for. */
  viewport: HTMLDivElement | null;
  startBackwardFetch: () => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  loading?: boolean;
}

const RecordTableCursorContext = createContext<CursorContext | null>(null);

const useRecordTableCursorContext = () => {
  const context = useContext(RecordTableCursorContext);

  if (!context) {
    throw new Error('Cursor skeletons must be used within a RecordTableCursorProvider');
  }

  return context;
};

/** Session storage is best effort: when it is blocked the position is simply not restored. */
const remember = (key: string, value: string) => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Blocked or full storage.
  }
};

const recall = (key: string) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
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

  const rememberScrollTop = useDebouncedCallback((scrollTop: number) => {
    if (sessionKey) remember(`${sessionKey}_scroll`, String(scrollTop));
  }, 150);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const scroll = event.currentTarget;
    const firstVisibleRow = scroll.querySelector('.in-view');

    if (sessionKey && firstVisibleRow) remember(sessionKey, firstVisibleRow.id);

    rememberScrollTop(scroll.scrollTop);
  };

  useEffect(() => {
    const scroll = scrollRef.current;

    if (!dataLength || loading || !scroll || !sessionKey) return;

    const saved = recall(`${sessionKey}_scroll`);

    if (saved) scroll.scrollTop = Number.parseInt(saved, 10);
  }, [loading, dataLength, scrollRef, sessionKey]);

  return (
    <RecordTableCursorContext.Provider
      value={{ viewport, startBackwardFetch, hasNextPage, hasPreviousPage, loading }}
    >
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
  const { hasNextPage, loading, viewport } = useRecordTableCursorContext();

  if (!hasNextPage || loading) return null;

  return (
    <RecordTableRowSkeleton
      rows={1}
      root={viewport}
      handleInView={() => handleFetchMore({ direction: EnumCursorDirection.FORWARD })}
    />
  );
};
