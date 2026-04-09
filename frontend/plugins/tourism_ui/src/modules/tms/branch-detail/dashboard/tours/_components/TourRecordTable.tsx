import { IconMapRoute } from '@tabler/icons-react';
import { RecordTable, Sheet } from 'erxes-ui';
import { useState } from 'react';
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

  const { categories } = useCategories();

  const handleEdit = (tourId: string) => {
    setEditTourId(tourId);
  };

  const handleDuplicate = (tourId: string, dateType?: 'fixed' | 'flexible') => {
    setDuplicateTourId(tourId);
    setDuplicateTourDateType(dateType);
  };

  const handleCloseEdit = (open: boolean) => {
    if (!open) {
      setEditTourId(null);
      setSideTab(null);
    }
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
        columns={TourColumns(categories || [], handleEdit, handleDuplicate)}
        data={tours || []}
        className="h-full"
        stickyColumns={['more', 'checkbox', 'name']}
      >
        <TourCommandBar />
        <RecordTable.CursorProvider
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          dataLength={tours?.length}
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
