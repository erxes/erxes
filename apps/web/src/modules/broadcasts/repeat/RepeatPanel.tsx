import type { Broadcast, BroadcastSchedule } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconRepeat } from '@tabler/icons-react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Badge, useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { forwardPaging } from '~/lib/cursorList';
import { paths } from '~/lib/paths';
import { inZone, zoneLabel } from '~/lib/timeZones';
import { useSession } from '~/modules/auth/session';
import { flattenPages, LoadMore, StatusBadge, usePercent } from '../BroadcastBits';
import { useDescribeRepeat } from './useDescribeRepeat';

const STATE_BADGE = {
  draft: 'secondary',
  active: 'success',
  paused: 'warning',
  ended: 'muted',
} as const satisfies Record<BroadcastSchedule['state'], string>;

/** Runs shown per page. */
const PAGE = 20;

/** One run: when it was for, where it stands, and how it did. */
const RunRow = ({ run }: { run: Broadcast }) => {
  const fmt = useFormat();
  const percent = usePercent();
  const { timezone } = useSession().organization;
  const at = run.occurrenceAt ?? run.scheduledAt ?? run.createdAt;

  return (
    <li className="flex items-center gap-3 py-2 text-sm">
      <Link
        to={paths.broadcasts.broadcast(run.id)}
        className="min-w-0 flex-1 truncate font-medium tabular-nums hover:underline"
      >
        {fmt.date(inZone(at, timezone), 'EEE, PP p')}
      </Link>
      <StatusBadge status={run.status} />
      <span className="w-28 text-right text-muted-foreground tabular-nums">
        {fmt.number(run.stats.sent)} / {fmt.number(run.total)}
      </span>
      <span className="w-14 text-right text-muted-foreground tabular-nums">
        {run.channel === 'email' ? percent(run.stats.opened, run.stats.sent) : '—'}
      </span>
    </li>
  );
};

/** The broadcasts the schedule has made, newest first. */
const RunList = ({ broadcast }: { broadcast: Broadcast }) => {
  const { t } = useTranslation('broadcasts');

  const runs = useInfiniteQuery(
    orpc.broadcasts.list.infiniteOptions({
      ...forwardPaging(PAGE),
      input: (page) => ({ ...page, parentId: broadcast.id }),
      select: flattenPages,
    }),
  );

  return (
    <QueryState
      query={runs}
      isEmpty={(data) => data.rows.length === 0}
      empty={
        <p className="text-sm text-muted-foreground">{t('repeat.no-runs-yet', 'No runs yet.')}</p>
      }
    >
      {(data) => (
        <div>
          <ul className="divide-y">
            {data.rows.map((run) => (
              <RunRow key={run.id} run={run} />
            ))}
          </ul>
          <LoadMore query={runs} />
        </div>
      )}
    </QueryState>
  );
};

/** The rule in words, where it stands, its next run on the organisation's clock. */
const ScheduleSummary = ({ schedule }: { schedule: BroadcastSchedule }) => {
  const { t } = useTranslation('broadcasts');
  const fmt = useFormat();
  const describe = useDescribeRepeat();
  const { timezone } = useSession().organization;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <IconRepeat className="size-4 text-muted-foreground" />
        <p className="font-medium">{describe(schedule)}</p>
        <Badge variant={STATE_BADGE[schedule.state]}>
          {t(`repeat.state.${schedule.state}`, schedule.state)}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {schedule.nextRunAt
          ? t('repeat.next-run', 'Next run {{when}} ({{zone}})', {
              when: fmt.date(inZone(schedule.nextRunAt, timezone), 'EEE, PP p'),
              zone: zoneLabel(timezone),
            })
          : t('repeat.no-next-run', 'No next run.')}{' '}
        {t('repeat.runs-so-far', '{{count}} runs so far.', { count: schedule.runs })}
      </p>
    </div>
  );
};

/** A recurring broadcast's schedule and the runs it made, each a broadcast of its own. */
export const RepeatPanel = ({ broadcast }: { broadcast: Broadcast }) => {
  const { t } = useTranslation('broadcasts');

  const schedule = useQuery(
    orpc.broadcastSchedules.get.queryOptions({ input: { id: broadcast.id } }),
  );

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <QueryState query={schedule}>
        {(data) => (data ? <ScheduleSummary schedule={data} /> : null)}
      </QueryState>
      <p className="text-xs text-muted-foreground">
        {t(
          'repeat.panel-hint',
          'Changes here reach later runs. Each run is a broadcast of its own, with its own numbers.',
        )}
      </p>
      <RunList broadcast={broadcast} />
    </section>
  );
};
