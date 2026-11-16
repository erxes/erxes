import type { Broadcast } from '@erxes/core-contract';
import { cn, ScrollArea, useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCan } from '~/modules/auth/session';
import { usePercent } from './BroadcastBits';
import { BroadcastActions } from './BroadcastActions';
import { BroadcastHeader } from './BroadcastHeader';
import { PreviewPanel } from './PreviewPanel';
import { RecipientsTable } from './RecipientsTable';

const Tile = ({ label, value, note }: { label: string; value: string; note?: string }) => (
  <div className="rounded-lg border bg-background p-4">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    {note && <p className="text-xs text-muted-foreground">{note}</p>}
  </div>
);

/** Sent, failed and skipped as one bar over the total. */
const Progress = ({ broadcast }: { broadcast: Broadcast }) => {
  const { t } = useTranslation('broadcasts');
  const { stats, total } = broadcast;
  const done = stats.sent + stats.failed + stats.skipped;
  const width = (part: number) => `${total ? (part / total) * 100 : 0}%`;

  const cssVariables: Record<`--${string}`, string> = {
    '--sent': width(stats.sent),
    '--failed': width(stats.failed),
    '--skipped': width(stats.skipped),
  };

  return (
    <div className="space-y-1.5">
      <progress
        className="sr-only"
        aria-label={t('progress', 'Progress')}
        max={total}
        value={done}
      />
      <div
        className="flex h-2 overflow-hidden rounded-full bg-muted"
        style={cssVariables}
        aria-hidden
      >
        <span className="w-(--sent) bg-success" />
        <span className="w-(--failed) bg-destructive" />
        <span className="w-(--skipped) bg-muted-foreground/40" />
      </div>
      <p className="text-xs text-muted-foreground">
        {t('progress-note', '{{done}} of {{total}} done · {{queued}} waiting', {
          done,
          total,
          queued: stats.queued + stats.sending,
        })}
      </p>
    </div>
  );
};

const Tiles = ({ broadcast }: { broadcast: Broadcast }) => {
  const { t } = useTranslation('broadcasts');
  const fmt = useFormat();
  const percent = usePercent();
  const { stats, total } = broadcast;

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-3',
        broadcast.channel === 'email' ? 'lg:grid-cols-6' : 'lg:grid-cols-4',
      )}
    >
      <Tile label={t('stat-recipients', 'Recipients')} value={fmt.number(total)} />
      <Tile
        label={t('stat-sent', 'Sent')}
        value={fmt.number(stats.sent)}
        note={percent(stats.sent, total)}
      />
      {broadcast.channel === 'email' && (
        <>
          <Tile
            label={t('stat-opened', 'Opened')}
            value={fmt.number(stats.opened)}
            note={percent(stats.opened, stats.sent)}
          />
          <Tile
            label={t('stat-clicked', 'Clicked')}
            value={fmt.number(stats.clicked)}
            note={percent(stats.clicked, stats.sent)}
          />
        </>
      )}
      <Tile
        label={t('stat-unsubscribed', 'Unsubscribed')}
        value={fmt.number(stats.unsubscribed)}
        note={percent(stats.unsubscribed, stats.sent)}
      />
      <Tile
        label={t('stat-failed', 'Failed')}
        value={fmt.number(stats.failed)}
        note={t('stat-skipped', '{{count}} skipped', { count: stats.skipped })}
      />
    </div>
  );
};

/** A broadcast that went or is going: its numbers, its recipients and its copy. */
export const BroadcastReport = ({ broadcast }: { broadcast: Broadcast }) => {
  const { t } = useTranslation('broadcasts');
  const fmt = useFormat();
  const can = useCan();

  return (
    <>
      <BroadcastHeader broadcast={broadcast}>
        <BroadcastActions broadcast={broadcast} />
      </BroadcastHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-7xl space-y-6 p-6">
          {broadcast.error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {broadcast.error}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {broadcast.startedAt &&
              t('started', 'Started {{when}}', { when: fmt.dateTime(broadcast.startedAt) })}
            {broadcast.finishedAt &&
              ` · ${t('finished', 'finished {{when}}', { when: fmt.dateTime(broadcast.finishedAt) })}`}
          </p>
          {broadcast.total > 0 && (
            <>
              <Tiles broadcast={broadcast} />
              <Progress broadcast={broadcast} />
            </>
          )}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2">
              <RecipientsTable broadcast={broadcast} />
            </div>
            <PreviewPanel broadcast={broadcast} canTest={can('broadcasts.manage')} />
          </div>
        </div>
      </ScrollArea>
    </>
  );
};
