import type { Broadcast } from '@erxes/core-contract';
import { memberQueries } from '@erxes/core-contract/client';
import {
  IconCalendarCheck,
  IconCalendarClock,
  IconClick,
  IconEye,
  IconLabelFilled,
  IconProgress,
  IconSend,
  IconSpeakerphone,
  IconUser,
  IconUserCircle,
  IconUsers,
} from '@tabler/icons-react';
import type { RecordTableColumnDef } from 'erxes-ui';
import { MemberInline, RecordTable, RecordTableInlineCell, useFormat } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { inZone } from '~/lib/timeZones';
import { useSession } from '~/modules/auth/session';
import { ChannelIcon, StatusBadge, usePercent } from '../BroadcastBits';
import { BroadcastMoreCell } from './BroadcastMoreCell';

type Translate = (key: string, defaultValue: string) => string;

const TextCell = ({ children, end }: { children: ReactNode; end?: boolean }) => (
  <RecordTableInlineCell className={end ? 'justify-end' : undefined}>
    <span className="truncate tabular-nums">{children}</span>
  </RecordTableInlineCell>
);

const NameCell = ({ broadcast }: { broadcast: Broadcast }) => (
  <RecordTableInlineCell>
    <Link
      to={paths.broadcasts.broadcast(broadcast.id)}
      className="truncate font-medium hover:underline"
    >
      {broadcast.name}
    </Link>
  </RecordTableInlineCell>
);

const ChannelCell = ({ channel }: { channel: Broadcast['channel'] }) => {
  const { t } = useTranslation('broadcasts');

  return (
    <RecordTableInlineCell>
      <ChannelIcon channel={channel} className="size-6 rounded-md" />
      {t(`channel.${channel}`, channel)}
    </RecordTableInlineCell>
  );
};

/** Who it goes to: a saved view, its own filter, or everyone. */
const AudienceCell = ({ broadcast }: { broadcast: Broadcast }) => {
  const { t } = useTranslation('broadcasts');

  if (broadcast.viewId) return <TextCell>{t('audience-view', 'A saved view')}</TextCell>;

  if (broadcast.filter) return <TextCell>{t('audience-filter', 'A filter')}</TextCell>;

  return <TextCell>{t('audience-everyone', 'All customers')}</TextCell>;
};

/** A count, and its share of `whole` when it has one; a dash before sending. */
const CountCell = ({ count, whole }: { count: number; whole?: number }) => {
  const fmt = useFormat();
  const percent = usePercent();

  if (whole === 0) return <TextCell end>—</TextCell>;

  return (
    <TextCell end>
      {fmt.number(count)}
      {whole !== undefined && (
        <span className="ml-1 text-muted-foreground">{percent(count, whole)}</span>
      )}
    </TextCell>
  );
};

const DateCell = ({ value }: { value: string | null }) => {
  const fmt = useFormat();
  const { timezone } = useSession().organization;

  return <TextCell>{value ? fmt.dateTime(inZone(value, timezone)) : ''}</TextCell>;
};

const head = (icon: typeof IconUser, label: string) => () => (
  <RecordTable.InlineHead icon={icon} label={label} />
);

/** The row's menu and checkbox, then what the broadcast is. */
const identityColumns = (t: Translate): RecordTableColumnDef<Broadcast>[] => [
  {
    id: 'more',
    header: () => <RecordTable.ColumnSelector />,
    cell: ({ row }) => <BroadcastMoreCell broadcast={row.original} />,
    size: 33,
  },
  RecordTable.checkboxColumnOf<Broadcast>(),
  {
    id: 'name',
    accessorKey: 'name',
    header: head(IconLabelFilled, t('name', 'Name')),
    cell: ({ row }) => <NameCell broadcast={row.original} />,
    size: 260,
  },
  {
    id: 'channel',
    accessorKey: 'channel',
    header: head(IconSpeakerphone, t('channel-filter', 'Channel')),
    cell: ({ row }) => <ChannelCell channel={row.original.channel} />,
    size: 120,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: head(IconProgress, t('status-filter', 'Status')),
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <StatusBadge status={row.original.status} />
      </RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'audience',
    header: head(IconUsers, t('audience', 'Audience')),
    cell: ({ row }) => <AudienceCell broadcast={row.original} />,
    size: 150,
  },
];

/** Who it reached and how it did, then when it went and who wrote it. */
const reportColumns = (t: Translate): RecordTableColumnDef<Broadcast>[] => [
  {
    id: 'total',
    accessorKey: 'total',
    header: head(IconUser, t('stat-recipients', 'Recipients')),
    cell: ({ row }) => <CountCell count={row.original.total} />,
    size: 120,
  },
  {
    id: 'sent',
    header: head(IconSend, t('stat-sent', 'Sent')),
    cell: ({ row }) => <CountCell count={row.original.stats.sent} whole={row.original.total} />,
    size: 130,
  },
  {
    id: 'opened',
    header: head(IconEye, t('stat-opened', 'Opened')),
    cell: ({ row }) =>
      row.original.channel === 'email' ? (
        <CountCell count={row.original.stats.opened} whole={row.original.stats.sent} />
      ) : (
        <TextCell end>—</TextCell>
      ),
    size: 130,
  },
  {
    id: 'clicked',
    header: head(IconClick, t('stat-clicked', 'Clicked')),
    cell: ({ row }) => (
      <CountCell count={row.original.stats.clicked} whole={row.original.stats.sent} />
    ),
    size: 130,
  },
  {
    id: 'goesAt',
    header: head(IconCalendarClock, t('list.goes-at', 'Goes out')),
    // A recurring broadcast goes out next at its next run.
    cell: ({ row }) => (
      <DateCell
        value={row.original.startedAt ?? row.original.scheduledAt ?? row.original.nextRunAt}
      />
    ),
    size: 180,
  },
  {
    id: 'finishedAt',
    accessorKey: 'finishedAt',
    header: head(IconCalendarCheck, t('list.finished-at', 'Finished')),
    cell: ({ row }) => <DateCell value={row.original.finishedAt} />,
    size: 180,
  },
  {
    id: 'createdBy',
    accessorKey: 'createdBy',
    header: head(IconUserCircle, t('list.created-by', 'Created by')),
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <MemberInline memberId={row.original.createdBy} members={memberQueries} size="sm" />
      </RecordTableInlineCell>
    ),
    size: 180,
  },
];

export const useBroadcastsColumns = () => {
  const { t } = useTranslation('broadcasts');

  return useMemo(() => [...identityColumns(t), ...reportColumns(t)], [t]);
};
