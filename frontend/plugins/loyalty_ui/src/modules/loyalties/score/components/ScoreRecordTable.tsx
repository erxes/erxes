import { RecordTable, Spinner } from 'erxes-ui';
import { IconStar } from '@tabler/icons-react';
import { makeScoreColumns } from './ScoreColumns';
import { useScoreList } from '../hooks/useScoreList';
import { IScoreLog } from '../types/score';
import { GiveScoreModal } from './GiveScoreModal';
import { ScoreDetailSheet } from './ScoreDetailSheet';
import { useState, useMemo } from 'react';

export const ScoreRecordTable = () => {
  const { list, loading } = useScoreList();
  const [selectedRecord, setSelectedRecord] = useState<IScoreLog | null>(null);

  const columns = useMemo(() => makeScoreColumns((row) => setSelectedRecord(row)), []);

  if (loading && !list?.length) return <Spinner />;

  return (
    <>
      <RecordTable.Provider
        columns={columns}
        data={(list || []).filter((r) => !!r.owner)}
        className="m-3 relative"
        stickyColumns={['more', 'ownerName']}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading ? (
              <RecordTable.RowSkeleton rows={32} />
            ) : (
              <RecordTable.RowList />
            )}
          </RecordTable.Body>
        </RecordTable>

        {!loading && list?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center text-center">
              <IconStar size={48} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                No scores yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 mb-4">
                Get started by giving your first score.
              </p>
              <GiveScoreModal />
            </div>
          </div>
        )}
      </RecordTable.Provider>

      <ScoreDetailSheet
        open={!!selectedRecord}
        onOpenChange={(open) => !open && setSelectedRecord(null)}
        record={selectedRecord}
      />
    </>
  );
};
