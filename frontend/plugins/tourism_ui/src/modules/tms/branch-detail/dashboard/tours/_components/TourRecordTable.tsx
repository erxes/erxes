import { IconMapRoute } from '@tabler/icons-react';
import { RecordTable, Sheet } from 'erxes-ui';
import { useCallback, useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';
import { TourCreateSheet } from './TourCreateSheet';
import { TourEditForm } from './TourEditForm';
import { TourColumns } from './TourColumns';
import { TourDuplicateSheet } from './TourDuplicateSheet';
import { useTours } from '../hooks/useTours';
import { TOURS_CURSOR_SESSION_KEY } from '../constants/tourCursorSessionKey';
import { TourCommandBar } from './TourCommandBar';
import { useCategories } from '../../category/hooks/useCategories';
import type { TourSideTab } from './TourOrdersSidePanel';

export const TourRecordTable = ({
  branchId,
  branchLanguages,
  mainLanguage,
}: {
  branchId: string;
  branchLanguages?: string[];
  mainLanguage?: string;
}) => {
  const [editTourId, setEditTourId] = useState<string | null>(null);
  const [sideTab, setSideTab] = useState<TourSideTab | null>(null);
  const [duplicateTourId, setDuplicateTourId] = useState<string | null>(null);
  const [duplicateTourDateType, setDuplicateTourDateType] = useState<
    'fixed' | 'flexible' | undefined
  >(undefined);

  const activeLang = useAtomValue(activeLangAtom);
  const language = activeLang || mainLanguage;

  const { tours, handleFetchMore, loading, pageInfo, totalCount } = useTours({
    variables: { branchId, language },
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const rowData = tours || [];

  const { categories } = useCategories({
    variables: {
      branchId,
      language,
    },
  });

  const handleEdit = useCallback((tourId: string) => {
    setEditTourId(tourId);
  }, []);

  const handleDuplicate = useCallback(
    (tourId: string, dateType?: 'fixed' | 'flexible') => {
      setDuplicateTourId(tourId);
      setDuplicateTourDateType(dateType);
    },
    [],
  );

  const handleCloseEdit = useCallback((open: boolean) => {
    if (!open) {
      setEditTourId(null);
      setSideTab(null);
    }
  }, []);
  const columns = useMemo(
    () => TourColumns(categories || [], handleEdit, handleDuplicate),
    [categories, handleDuplicate, handleEdit],
  );

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
        <TourCommandBar
          branchId={branchId}
          branchLanguages={branchLanguages}
          mainLanguage={mainLanguage}
        />
        <RecordTable.CursorProvider
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          dataLength={rowData.length}
          sessionKey={TOURS_CURSOR_SESSION_KEY}
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

      <Sheet open={!!editTourId} onOpenChange={handleCloseEdit}>
        <Sheet.View
          className={`p-0 transition-all duration-200 ${
            sideTab
              ? 'w-[1220px] sm:max-w-[1220px]'
              : 'w-[900px] sm:max-w-[900px]'
          }`}
        >
          {editTourId && (
            <TourEditForm
              tourId={editTourId}
              branchId={branchId}
              branchLanguages={branchLanguages}
              mainLanguage={mainLanguage}
              onSuccess={() => handleCloseEdit(false)}
              sideTab={sideTab}
              onSideTabChange={setSideTab}
            />
          )}
        </Sheet.View>
      </Sheet>

      {duplicateTourId && (
        <TourDuplicateSheet
          tourId={duplicateTourId}
          dateType={duplicateTourDateType}
          branchId={branchId}
          branchLanguages={branchLanguages}
          mainLanguage={mainLanguage}
          open={!!duplicateTourId}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setDuplicateTourId(null);
              setDuplicateTourDateType(undefined);
            }
          }}
        />
      )}
    </>
  );
};

function EmptyStateRow({
  branchId,
  branchLanguages,
  mainLanguage,
}: {
  readonly branchId: string;
  readonly branchLanguages?: string[];
  readonly mainLanguage?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 w-full min-h-[80vh] text-center">
      <IconMapRoute size={64} stroke={1.5} className="text-muted-foreground" />
      <h2 className="text-lg font-semibold text-muted-foreground">
        No tour yet
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Create your first tour to get started.
      </p>
      <TourCreateSheet
        branchId={branchId}
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
      />
    </div>
  );
}
