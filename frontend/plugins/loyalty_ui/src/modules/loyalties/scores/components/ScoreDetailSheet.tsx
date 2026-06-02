import { useQuery } from '@apollo/client';
import { fixNum, RecordTable, Sheet, Spinner } from 'erxes-ui';
import { SCORE_LOGS_QUERY } from '../graphql/queries';
import { IScoreLog } from '../types/score';
import { getOwnerName, scoreDetailColumns } from './ScoreColumns';

interface ScoreDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: IScoreLog | null;
}

const formatScore = (value?: number) => fixNum(value, 4).toLocaleString();

export const ScoreDetailSheet = ({
  open,
  onOpenChange,
  record,
}: ScoreDetailSheetProps) => {
  const ownerName = record ? getOwnerName(record.owner, record.ownerType) : '';

  // The detail is keyed by person: every score log row of the same owner opens
  // the same set of entries. We resolve them from the owner carried by the
  // selected (latest) score log, without a separate owner lookup.
  const { data, loading } = useQuery(SCORE_LOGS_QUERY, {
    variables: {
      ownerId: record?.ownerId,
      ownerType: record?.ownerType,
      limit: 100,
    },
    skip: !open || !record?.ownerId,
    fetchPolicy: 'cache-and-network',
  });

  const logs: IScoreLog[] = data?.scoreLogs?.list || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal>
      <Sheet.View side="bottom" className="h-[70vh] p-0 flex flex-col">
        <Sheet.Header className="border-b px-6 py-4 gap-3 shrink-0">
          <div>
            <Sheet.Title>{ownerName || '—'}</Sheet.Title>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {record?.ownerType || ''} · Total Score:{' '}
              <span className="font-semibold text-foreground">
                {formatScore(record?.totalScore)}
              </span>
            </p>
          </div>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex-1 min-h-0 p-4 overflow-auto">
          {loading && logs.length === 0 ? (
            <Spinner containerClassName="py-10" />
          ) : logs.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
              No log records found
            </div>
          ) : (
            <div className="rounded-md overflow-hidden">
              <RecordTable.Provider columns={scoreDetailColumns} data={logs}>
                <RecordTable>
                  <RecordTable.Header />
                  <RecordTable.Body>
                    <RecordTable.RowList />
                  </RecordTable.Body>
                </RecordTable>
              </RecordTable.Provider>
            </div>
          )}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
