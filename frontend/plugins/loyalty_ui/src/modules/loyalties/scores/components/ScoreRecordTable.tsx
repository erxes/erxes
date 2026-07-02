import { useAtom } from 'jotai';
import { RecordTable, Spinner } from 'erxes-ui';
import { IconStar } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { scoreLogColumns } from './ScoreColumns';
import {
  SCORE_LOG_CURSOR_SESSION_KEY,
  useScoreList,
} from '../hooks/useScoreList';
import { GiveScoreModal } from './GiveScoreModal';
import { ScoreDetailSheet } from './ScoreDetailSheet';
import { scoreDetailRecordAtom } from '../states/scoreDetail';

export const ScoreRecordTable = () => {
  const { t } = useTranslation('loyalty');
  const { list, loading, handleFetchMore, pageInfo } = useScoreList();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const [detailRecord, setDetailRecord] = useAtom(scoreDetailRecordAtom);

  const columnsKey = scoreLogColumns.map((c) => c.id || '').join('|');

  if (loading && !list?.length) return <Spinner />;

  return (
    <>
      <RecordTable.Provider
      key={columnsKey}
      columns={scoreLogColumns}
      data={list || []}
      className="m-3 relative"
      stickyColumns={['more', 'ownerName']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={list?.length}
        sessionKey={SCORE_LOG_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading ? (
              <RecordTable.RowSkeleton rows={32} />
            ) : (
              <RecordTable.RowList />
            )}
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>

        {!loading && list?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center text-center">
              <IconStar size={48} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t('no-scores-yet')}
              </h3>
              <p className="mt-1 text-sm text-gray-500 mb-4">
                {t('get-started-score')}
              </p>
              <GiveScoreModal />
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
      </RecordTable.Provider>
      <ScoreDetailSheet
        open={!!detailRecord}
        onOpenChange={(value) => {
          if (!value) setDetailRecord(null);
        }}
        record={detailRecord}
      />
    </>
  );
};
