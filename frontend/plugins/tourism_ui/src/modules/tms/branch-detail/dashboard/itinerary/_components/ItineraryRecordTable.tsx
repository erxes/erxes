import { IconShoppingCartX } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { ItineraryCreateSheet } from './ItineraryCreateSheet';
import { itineraryColumns } from './ItineraryColumns';
import { useItineraries } from '../hooks/useItineraries';
import { ITINERARIES_CURSOR_SESSION_KEY } from '../constants/itineraryCursorSessionKey';
import { ItineraryCommandBar } from './ItineraryCommandBar';

export const ItineraryRecordTable = ({ branchId }: { branchId: string }) => {
  const { itineraries, handleFetchMore, loading, pageInfo, totalCount } = useItineraries({
    variables: { branchId },
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  if (!loading && (totalCount ?? 0) === 0) {
    return <EmptyStateRow branchId={branchId} />;
  }

  return (
    <RecordTable.Provider
      columns={itineraryColumns()}
      data={itineraries || []}
      className="h-full"
      stickyColumns={['checkbox', 'name']}
    >
      <ItineraryCommandBar />
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={itineraries?.length}
        sessionKey={ITINERARIES_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading && <RecordTable.RowSkeleton rows={30} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

function EmptyStateRow({ branchId }: { branchId: string }) {
  return (
    <div className="flex flex-col gap-2 justify-center items-center p-6 w-full h-full text-center">
      <IconShoppingCartX
        size={64}
        stroke={1.5}
        className="text-muted-foreground"
      />
      <h2 className="text-lg font-semibold text-muted-foreground">
        No itinerary yet
      </h2>
      <p className="mb-4 text-md text-muted-foreground">
        Get started by creating your first itinerary.
      </p>
      <ItineraryCreateSheet branchId={branchId} />
    </div>
  );
}
