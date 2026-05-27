import { IconLayoutGrid } from '@tabler/icons-react';
import { RecordTable, useMultiQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { AmenityCreateSheet } from './AmenityCreateSheet';
import { amenityColumns } from './AmenityColumns';
import { useAmenities } from '../hooks/useAmenities';
import { AMENITIES_CURSOR_SESSION_KEY } from '../constants/amenityCursorSessionKey';
import { AmenityCommandBar } from './AmenityCommandBar';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';

interface AmenityRecordTableProps {
  branchId: string;
  branchLanguages?: string[];
  mainLanguage?: string;
}

export const AmenityRecordTable = ({
  branchId,
  branchLanguages,
  mainLanguage,
}: AmenityRecordTableProps) => {
  const activeLang = useAtomValue(activeLangAtom);
  const language = activeLang || mainLanguage;

  const [queries] = useMultiQueryState<{
    searchValue: string;
  }>(['searchValue']);

  const { amenities, handleFetchMore, loading, pageInfo, totalCount } =
    useAmenities({
      variables: {
        quick: true,
        branchId,
        name: queries?.searchValue || undefined,
        language,
      },
    });

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

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
    <RecordTable.Provider
      columns={amenityColumns(branchId, branchLanguages, mainLanguage)}
      data={amenities || []}
      className="h-full"
      stickyColumns={['more', 'checkbox', 'name', 'icon']}
    >
      <AmenityCommandBar />
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={amenities?.length}
        sessionKey={AMENITIES_CURSOR_SESSION_KEY}
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
      <IconLayoutGrid
        size={64}
        stroke={1.5}
        className="text-muted-foreground"
      />

      <h2 className="text-lg font-semibold text-muted-foreground">
        No amenities yet
      </h2>

      <p className="max-w-sm text-sm text-muted-foreground">
        Create your first amenity to get started.
      </p>

      <AmenityCreateSheet
        branchId={branchId}
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
      />
    </div>
  );
}
