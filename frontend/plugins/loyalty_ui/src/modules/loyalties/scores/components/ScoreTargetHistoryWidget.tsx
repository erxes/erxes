import { IconRefresh } from '@tabler/icons-react';
import { Button, cn, ScrollArea, Separator, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SafeRelativeDate } from '../../components/SafeRelativeDate';
import { useTargetScoreLogs } from '../hooks/useTargetScoreLogs';
import { getOwnerName } from './ScoreColumns';

const formatChange = (change: number) =>
  `${change > 0 ? '+' : ''}${change.toLocaleString()}`;

// What a record (a deal, an order) earned, spent and gave back, and for whom.
export const ScoreTargetHistoryWidget = ({
  targetId,
}: {
  targetId: string;
}) => {
  const { t } = useTranslation('loyalty');
  const { logs, total, loading, error, refetching, refetch } =
    useTargetScoreLogs(targetId);

  return (
    <>
      <div className="h-11 px-4 flex items-center gap-2 flex-none bg-background">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={refetching}
          onClick={refetch}
          aria-label={t('refresh')}
        >
          <IconRefresh className={cn('size-4', refetching && 'animate-spin')} />
        </Button>
        <span className="font-medium text-primary">
          {t('target-score-history')}
        </span>
        {logs.length > 0 && (
          <span className="ml-auto text-sm font-semibold">
            {formatChange(total)}
          </span>
        )}
      </div>
      <Separator />
      <ScrollArea className="flex-auto">
        <div className="p-4 flex flex-col gap-2">
          {loading && <Spinner containerClassName="py-10" />}
          {error && <p className="text-sm text-destructive">{error.message}</p>}
          {!loading && !error && !logs.length && (
            <p className="text-sm text-muted-foreground">
              {t('target-score-history-empty')}
            </p>
          )}
          {logs.map((log) => {
            const change = Number(log.change) || 0;

            return (
              <div
                key={log._id}
                className="flex flex-col gap-0.5 rounded-md border px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {log.campaign?.title || t('untitled')}
                  </span>
                  <span
                    className={
                      change < 0
                        ? 'font-semibold text-destructive'
                        : 'font-semibold text-success'
                    }
                  >
                    {formatChange(change)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">
                    {getOwnerName(log.owner, log.ownerType) || log.ownerId}
                  </span>
                  <span>·</span>
                  <span>
                    {t(`target-score-action-${log.action}`, {
                      defaultValue: log.action,
                    })}
                  </span>
                  <span className="ml-auto shrink-0">
                    <SafeRelativeDate value={log.createdAt} />
                  </span>
                </div>
                {log.description && (
                  <p className="text-xs text-muted-foreground">
                    {log.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </>
  );
};
