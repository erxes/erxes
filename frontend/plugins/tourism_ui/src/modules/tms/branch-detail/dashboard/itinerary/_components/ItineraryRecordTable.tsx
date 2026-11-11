import { IconRoute } from '@tabler/icons-react';
import { RecordTable, useMultiQueryState } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ItineraryCreateSheet } from './ItineraryCreateSheet';
import { itineraryColumns } from './ItineraryColumns';
import { useItineraries } from '../hooks/useItineraries';
import { ITINERARIES_CURSOR_SESSION_KEY } from '../constants/itineraryCursorSessionKey';
import { ItineraryCommandBar } from './ItineraryCommandBar';
import { useAtomValue } from 'jotai';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';
import { TMS_ITINERARY_CONTENT_TYPE } from '@/tms/side-panel/tourismPanelTypes';
import { useTourismPanel } from '@/tms/side-panel/useTourismPanel';
import { TOURISM_RECORD_TABLE_CLASS_NAME } from '@/tms/constants/recordTable';

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
  const { t } = useTranslation('tourism');
  const activeLang = useAtomValue(activeLangAtom);
  const language = activeLang || mainLanguage;

  const [queries] = useMultiQueryState<{
    searchValue: string;
  }>(['searchValue']);

  const { openDetail } = useTourismPanel(TMS_ITINERARY_CONTENT_TYPE);
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

  const columns = useMemo(
    () =>
      itineraryColumns(
        {
          onEditClick: (itineraryId: string) => openDetail(itineraryId),
          branchId,
          branchLanguages,
          mainLanguage,
        },
        t,
      ),
    [branchId, branchLanguages, openDetail, mainLanguage, t],
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
    <RecordTable.Provider
      columns={columns}
      data={rowData}
      className={TOURISM_RECORD_TABLE_CLASS_NAME}
      stickyColumns={['more', 'checkbox', 'name']}
      tableId="tourism_itineraries_record_table"
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
            {loading && !rowData.length && (
              <RecordTable.RowSkeleton rows={30} />
            )}
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
  const { t } = useTranslation('tourism');
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 w-full min-h-[80vh] text-center">
      <IconRoute size={64} stroke={1.5} className="text-muted-foreground" />
      <h2 className="text-lg font-semibold text-muted-foreground">
        {t('no-itinerary-yet')}
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t('no-itinerary-yet-desc')}
      </p>
      <ItineraryCreateSheet
        branchId={branchId}
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
      />
    </div>
  );
}
