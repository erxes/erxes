import { IconRoute } from '@tabler/icons-react';
import { RecordTable, useMultiQueryState } from 'erxes-ui';
import { useState } from 'react';
import { ItineraryCreateSheet } from './ItineraryCreateSheet';
import { ItineraryEditSheet } from './ItineraryEditSheet';
import { itineraryColumns } from './ItineraryColumns';
import { useItineraries } from '../hooks/useItineraries';
import { ITINERARIES_CURSOR_SESSION_KEY } from '../constants/itineraryCursorSessionKey';
import { ItineraryCommandBar } from './ItineraryCommandBar';

export const ItineraryRecordTable = ({ branchId }: { branchId: string }) => {
  const [queries] = useMultiQueryState<{
    searchValue: string;
  }>(['searchValue']);

  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [selectedItineraryId, setSelectedItineraryId] = useState<string>();
  const [selectedBranchId, setSelectedBranchId] = useState<string>();

  const { itineraries, handleFetchMore, loading, pageInfo, totalCount } =
    useItineraries({
      variables: {
        branchId,
        name: queries?.searchValue || undefined,
      },
    });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const handleEditClick = (itineraryId: string, itineraryBranchId?: string) => {
    setSelectedItineraryId(itineraryId);
    setSelectedBranchId(itineraryBranchId || branchId);
    setEditSheetOpen(true);
  };

  if (!loading && (totalCount ?? 0) === 0) {
    return <EmptyStateRow branchId={branchId} />;
  }

  return (
    <>
      <RecordTable.Provider
        columns={itineraryColumns({ onEditClick: handleEditClick, branchId })}
        data={itineraries || []}
        className="h-full"
        stickyColumns={['more', 'checkbox', 'name']}
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

      <ItineraryEditSheet
        itineraryId={selectedItineraryId}
        branchId={selectedBranchId}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
      />
    </>
  );
};

function EmptyStateRow({ branchId }: { branchId: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 w-full min-h-[80vh] text-center">
      <IconRoute size={64} stroke={1.5} className="text-muted-foreground" />
      <h2 className="text-lg font-semibold text-muted-foreground">
        No itinerary yet
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Create your first itinerary to get started.
      </p>
      <ItineraryCreateSheet branchId={branchId} />
    </div>
  );
}
