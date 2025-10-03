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

  const handleScroll = () => {
    const firstVisibleRow = scrollRef.current?.querySelector('.in-view');
    if (firstVisibleRow && sessionKey) {
      sessionStorage.setItem(sessionKey, firstVisibleRow.id);
    }
  };

  return (
    <RecordTableCursorContext.Provider
      value={{
        scrollRef,
        isFetchBackward,
        setIsFetchBackward,
        distanceFromBottomRef,
        hasNextPage,
        hasPreviousPage,
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
