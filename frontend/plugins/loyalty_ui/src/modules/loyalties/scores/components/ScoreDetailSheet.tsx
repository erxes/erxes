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

const SCORE_DETAIL_LIMIT = 100;

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
  const { data, loading, error } = useQuery(SCORE_LOGS_QUERY, {
    variables: {
      ownerId: record?.ownerId,
      ownerType: record?.ownerType,
      limit: SCORE_DETAIL_LIMIT,
    },
    skip: !open || !record?.ownerId,
    fetchPolicy: 'cache-and-network',
  });

  const logs: IScoreLog[] = data?.scoreLogs?.list || [];
  const isTruncated = logs.length >= SCORE_DETAIL_LIMIT;

  const renderBody = () => {
    if (loading && logs.length === 0) {
      return <Spinner containerClassName="py-10" />;
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-24 text-xs text-destructive">
          {error.message || 'Failed to load score logs'}
        </div>
      );
    }

    if (logs.length === 0) {
      return (
        <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
          No log records found
        </div>
      );
    }

    return (
      <div className="rounded-md overflow-hidden">
        <RecordTable.Provider columns={scoreDetailColumns} data={logs}>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Provider>
        {isTruncated && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Showing the latest {SCORE_DETAIL_LIMIT} entries.
          </p>
        )}
      </div>
    );
  };

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
          {renderBody()}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
