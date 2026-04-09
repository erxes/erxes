import { IconRoute } from '@tabler/icons-react';
import { RecordTable, useMultiQueryState } from 'erxes-ui';
import { useCallback, useMemo, useState } from 'react';
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

interface EditSheetState {
  open: boolean;
  itineraryId?: string;
  branchId: string;
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

  const [editSheetState, setEditSheetState] = useState<EditSheetState>({
    open: false,
    branchId,
  });
  const searchValue = queries?.searchValue?.trim() || undefined;

  const { itineraries, handleFetchMore, loading, pageInfo, totalCount } =
    useItineraries({
      variables: {
        branchId,
        name: searchValue,
        language,
      },
    });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const handleEditClick = useCallback(
    (itineraryId: string, itineraryBranchId?: string) => {
      setEditSheetState({
        open: true,
        itineraryId,
        branchId: itineraryBranchId || branchId,
      });
    },
    [branchId],
  );
  const handleEditSheetOpenChange = useCallback(
    (open: boolean) => {
      setEditSheetState((current) =>
        open
          ? current
          : {
              open: false,
              itineraryId: undefined,
              branchId,
            },
      );
    },
    [branchId],
  );
  const columns = useMemo(
    () =>
      itineraryColumns({
        onEditClick: handleEditClick,
        branchId,
        branchLanguages,
        mainLanguage,
      }),
    [branchId, branchLanguages, handleEditClick, mainLanguage],
  );
  const rowData = itineraries || [];

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
        columns={columns}
        data={rowData}
        className="h-full"
        stickyColumns={['more', 'checkbox', 'name']}
      >
        <ItineraryCommandBar
          branchId={branchId}
          branchLanguages={branchLanguages}
          mainLanguage={mainLanguage}
        />
        <RecordTable.CursorProvider
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          dataLength={rowData.length}
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
        itineraryId={editSheetState.itineraryId}
        branchId={editSheetState.branchId}
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
        open={editSheetState.open}
        onOpenChange={handleEditSheetOpenChange}
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
