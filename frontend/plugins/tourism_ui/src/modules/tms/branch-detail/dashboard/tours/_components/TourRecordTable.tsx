import { IconMapRoute } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';
import { TourCreateButton } from './TourPanel';
import { TourColumns } from './TourColumns';
import { TourDuplicateSheet } from './TourDuplicateSheet';
import { useTours } from '../hooks/useTours';
import { TOURS_CURSOR_SESSION_KEY } from '../constants/tourCursorSessionKey';
import { TourCommandBar } from './TourCommandBar';
import { useCategories } from '../../category/hooks/useCategories';
import { TMS_TOUR_CONTENT_TYPE } from '@/tms/side-panel/tourismPanelTypes';
import { useTourismPanel } from '@/tms/side-panel/useTourismPanel';

export const TourRecordTable = ({
  branchId,
  branchLanguages,
  mainLanguage,
}: {
  branchId: string;
  branchLanguages?: string[];
  mainLanguage?: string;
}) => {
  const [duplicateTourId, setDuplicateTourId] = useState<string | null>(null);
  const [duplicateTourDateType, setDuplicateTourDateType] = useState<
    'fixed' | 'flexible' | undefined
  >(undefined);

  const { t } = useTranslation('tourism');
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

  const { openDetail } = useTourismPanel(TMS_TOUR_CONTENT_TYPE);

  const handleEdit = useCallback(
    (tourId: string) => openDetail(tourId),
    [openDetail],
  );

  const handleDuplicate = useCallback(
    (tourId: string, dateType?: 'fixed' | 'flexible') => {
      setDuplicateTourId(tourId);
      setDuplicateTourDateType(dateType);
    },
    [],
  );

  const columns = useMemo(
    () => TourColumns(categories || [], handleEdit, handleDuplicate, t),
    [categories, handleDuplicate, handleEdit, t],
  );

  if (!loading && (totalCount ?? 0) === 0) {
    return <EmptyStateRow branchId={branchId} />;
  }

  return (
    <>
      <RecordTable.Provider
        columns={columns}
        data={rowData}
        className="h-full"
        stickyColumns={['more', 'checkbox', 'name']}
        tableId="tourism_tours_record_table"
      >
        <TourCommandBar branchId={branchId} mainLanguage={mainLanguage} />
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

function EmptyStateRow({ branchId }: Readonly<{ branchId: string }>) {
  const { t } = useTranslation('tourism');
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 w-full min-h-[80vh] text-center">
      <IconMapRoute size={64} stroke={1.5} className="text-muted-foreground" />
      <h2 className="text-lg font-semibold text-muted-foreground">
        {t('no-tours-yet')}
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t('no-tours-yet-desc')}
      </p>
      <TourCreateButton branchId={branchId} />
    </div>
  );
}
