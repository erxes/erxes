import { IconRoute } from '@tabler/icons-react';
import { RecordTable, useMultiQueryState } from 'erxes-ui';
import { useState } from 'react';
import { ItineraryCreateSheet } from './ItineraryCreateSheet';
import { ItineraryEditSheet } from './ItineraryEditSheet';
import { itineraryColumns } from './ItineraryColumns';
import { useItineraries } from '../hooks/useItineraries';
import { ITINERARIES_CURSOR_SESSION_KEY } from '../constants/itineraryCursorSessionKey';
import { ItineraryCommandBar } from './ItineraryCommandBar';
import { useAtomValue } from 'jotai';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';

interface ItineraryRecordTableProps {
  branchId: string;
  branchLanguages?: string[];
  mainLanguage?: string;
}

export const ItineraryRecordTable = ({
  branchId,
  branchLanguages,
  mainLanguage,
}: ItineraryRecordTableProps) => {
  const activeLang = useAtomValue(activeLangAtom);
  const language = activeLang || mainLanguage;

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
        language,
      },
    });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const handleEditClick = (itineraryId: string, itineraryBranchId?: string) => {
    setSelectedItineraryId(itineraryId);
    setSelectedBranchId(itineraryBranchId || branchId);
    setEditSheetOpen(true);
  };

  if (!loading && (totalCount ?? 0) === 0) {
    return (
      <EmptyStateRow
        branchId={branchId}
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
      />
    );
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
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
      />
    </>
  );
};

function EmptyStateRow({
  branchId,
  branchLanguages,
  mainLanguage,
}: {
  branchId: string;
  branchLanguages?: string[];
  mainLanguage?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 w-full min-h-[80vh] text-center">
      <IconRoute size={64} stroke={1.5} className="text-muted-foreground" />
      <h2 className="text-lg font-semibold text-muted-foreground">
        No itinerary yet
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Create your first itinerary to get started.
      </p>
      <ItineraryCreateSheet
        branchId={branchId}
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
      />
    </div>
  );
}
