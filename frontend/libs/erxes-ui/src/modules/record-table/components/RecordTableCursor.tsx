import { useRef, useEffect } from 'react';
import { ScrollArea } from 'erxes-ui/components';
import { RecordTable } from 'erxes-ui/modules';
import { EnumCursorDirection } from '../types/RecordTableCursorTypes';
import { RecordTableCursorContext } from '../contexts/RecordTableCursorContext';
import { useRecordTableCursorContext } from '../hooks/useRecordTableCursorContext';
import { useCursorScroll } from 'erxes-ui/hooks/use-cursor-pagination';

export const RecordTableCursorProvider = ({
  children,
  hasPreviousPage,
  loading,
  dataLength,
  hasNextPage,
  sessionKey,
  offset = 102,
}: {
  children: React.ReactNode;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  loading?: boolean;
  dataLength?: number;
  sessionKey?: string;
  offset?: number;
}) => {
  const {
    scrollRef,
    isFetchBackward,
    setIsFetchBackward,
    distanceFromBottomRef,
  } = useCursorScroll({
    dataLength,
    hasPreviousPage,
    offset,
  });
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleScroll = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const firstVisibleRow = scrollRef.current?.querySelector('.in-view');
    if (firstVisibleRow && sessionKey) {
      sessionStorage.setItem(sessionKey, firstVisibleRow.id);
    }
    debounceTimer.current = setTimeout(() => {
      try {
        sessionStorage.setItem(
          `${sessionKey}_scroll`,
          String(scrollRef.current?.scrollTop),
        );
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }, 150);
  };
  useEffect(() => {
    if (!dataLength || loading) return;
    if (!scrollRef.current) return;
    const saved = sessionStorage.getItem(`${sessionKey}_scroll`);
    if (!saved) return;
    scrollRef.current.scrollTop = parseInt(saved, 10);
  }, [loading, dataLength, scrollRef, sessionKey]);

  return (
    <RecordTableCursorContext.Provider
      value={{
        scrollRef,
        isFetchBackward,
        setIsFetchBackward,
        distanceFromBottomRef,
        hasNextPage,
        hasPreviousPage,
        loading,
      }}
    >
      <ScrollArea.Root className="h-full w-full pb-2 pr-2 relative">
        <ScrollArea.Viewport ref={scrollRef} onScroll={handleScroll}>
          <div className="min-h-[calc(100vh-8rem)]">{children}</div>
        </ScrollArea.Viewport>

        <ScrollArea.Bar orientation="vertical" />
        <ScrollArea.Bar orientation="horizontal" />
      </ScrollArea.Root>
    </RecordTableCursorContext.Provider>
  );
};

export const RecordTableBackwardSkeleton = ({
  handleFetchMore,
}: {
  handleFetchMore: (params: { direction: EnumCursorDirection }) => void;
}) => {
  const {
    setIsFetchBackward,
    scrollRef,
    distanceFromBottomRef,
    hasPreviousPage,
    loading,
  } = useRecordTableCursorContext();

  if (!hasPreviousPage || loading) {
    return null;
  }

  return (
    <RecordTable.RowSkeleton
      rows={3}
      backward
      handleInView={() => {
        setIsFetchBackward(true);
        handleFetchMore({ direction: EnumCursorDirection.BACKWARD });
        if (scrollRef.current) {
          distanceFromBottomRef.current =
            scrollRef.current.scrollHeight - scrollRef.current.scrollTop;
        }
      }}
    />
  );
};

export const RecordTableForwardSkeleton = ({
  handleFetchMore,
}: {
  handleFetchMore: (params: { direction: EnumCursorDirection }) => void;
}) => {
  const { hasNextPage, loading } = useRecordTableCursorContext();

  if (!hasNextPage || loading) {
    return null;
  }

  const handleInView = () => {
    handleFetchMore({ direction: EnumCursorDirection.FORWARD });
  };

  return <RecordTable.RowSkeleton rows={1} handleInView={handleInView} />;
};
