import { Dialog, Skeleton } from 'erxes-ui';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePollDetail } from '@/poll/hooks/usePollDetail';

export const PollResultsDialog = ({
  pollId,
  trigger,
}: {
  pollId: string;
  trigger: ReactNode;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  const { poll, loading } = usePollDetail({
    variables: { _id: pollId },
    skip: !open,
  });

  const results = poll?.results;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>{poll?.title || t('poll-results')}</Dialog.Title>
          <Dialog.Description>{poll?.question || ''}</Dialog.Description>
        </Dialog.Header>

        {loading && !poll ? (
          <div className="flex flex-col gap-2 py-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : !results || results.totalVotes === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('poll-no-votes')}
          </p>
        ) : (
          <div className="flex flex-col gap-1.5 py-2">
            {results.options.map((option) => (
              <div
                key={option._id}
                className="relative overflow-hidden rounded border bg-accent/40 px-3 py-2"
              >
                <div
                  className="absolute inset-y-0 left-0 bg-primary/15"
                  style={{ width: `${option.percent}%` }}
                />
                <div className="relative flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{option.text}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {option.count} · {option.percent}%
                  </span>
                </div>
              </div>
            ))}
            <p className="mt-1 text-xs text-muted-foreground">
              {t('poll-total-votes', {
                votes: results.totalVotes,
                voters: results.voterCount,
              })}
            </p>
          </div>
        )}
      </Dialog.Content>
    </Dialog>
  );
};
