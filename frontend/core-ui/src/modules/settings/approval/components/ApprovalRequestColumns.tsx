import {
  IconCalendarTime,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconLock,
  IconMessage,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  TextOverflowTooltip,
} from 'erxes-ui';
import { Link } from 'react-router-dom';
import {
  ApprovalNotificationActions,
  ApprovalRequest,
  ApprovalRequestStatus,
  IUser,
} from 'ui-modules';

const getUserName = (user?: IUser) => {
  const firstLastName = [user?.details?.firstName, user?.details?.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    user?.details?.fullName ||
    firstLastName ||
    user?.email ||
    user?.username ||
    '-'
  );
};

const statusMeta: Record<
  ApprovalRequestStatus,
  {
    variant: 'success' | 'destructive' | 'secondary' | 'warning';
    icon: typeof IconClock;
  }
> = {
  pending: {
    variant: 'warning',
    icon: IconClock,
  },
  approved: {
    variant: 'success',
    icon: IconCircleCheck,
  },
  rejected: {
    variant: 'destructive',
    icon: IconCircleX,
  },
  cancelled: {
    variant: 'secondary',
    icon: IconCircleX,
  },
};

export const approvalRequestColumns = ({
  t,
  onCompleted,
}: {
  t: (key: string) => string;
  onCompleted: () => void;
}): ColumnDef<ApprovalRequest>[] => [
  {
    id: 'status',
    accessorKey: 'status',
    size: 120,
    minSize: 110,
    header: () => <RecordTable.InlineHead label={t('status')} />,
    cell: ({ row }) => {
      const status = row.original.status;
      const { icon: Icon, variant } = statusMeta[status];

      return (
        <RecordTableInlineCell>
          <Badge
            variant={variant}
            className="uppercase tracking-wide text-[11px] px-2 py-0.5"
          >
            <Icon className="size-3.5" />
            {t(`status-${status}`)}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'target',
    size: 240,
    minSize: 180,
    header: () => (
      <RecordTable.InlineHead icon={IconLock} label={t('target')} />
    ),
    cell: ({ row }) => {
      const { content, contentType } = row.original;
      const label = content?.label || contentType;
      const link = content?.link;

      return (
        <RecordTableInlineCell className="min-w-0 gap-2">
          <IconLock className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 space-y-0.5">
            {link ? (
              <Link
                to={link}
                className="block min-w-0 font-medium hover:underline"
              >
                <TextOverflowTooltip value={label} />
              </Link>
            ) : (
              <TextOverflowTooltip value={label} />
            )}
            <div className="truncate text-xs text-muted-foreground">
              {contentType}
            </div>
          </div>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'requester',
    size: 180,
    minSize: 150,
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label={t('requester')} />
    ),
    cell: ({ row }) => (
      <RecordTableInlineCell className="min-w-0">
        <TextOverflowTooltip value={getUserName(row.original.requester)} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'reason',
    accessorKey: 'reason',
    size: 220,
    minSize: 160,
    header: () => (
      <RecordTable.InlineHead icon={IconMessage} label={t('reason')} />
    ),
    cell: ({ row }) => (
      <RecordTableInlineCell className="min-w-0">
        <TextOverflowTooltip value={row.original.reason || '-'} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'approvers',
    size: 220,
    minSize: 160,
    header: () => (
      <RecordTable.InlineHead icon={IconUsers} label={t('approvers')} />
    ),
    cell: ({ row }) => {
      const approverNames = (row.original.requiredApprovers || [])
        .map(getUserName)
        .filter((name) => name !== '-');

      return (
        <RecordTableInlineCell className="min-w-0">
          <TextOverflowTooltip
            value={approverNames.length ? approverNames.join(', ') : '-'}
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    size: 130,
    minSize: 118,
    header: () => (
      <RecordTable.InlineHead icon={IconCalendarTime} label={t('created')} />
    ),
    cell: ({ row }) => (
      <RecordTableInlineCell className="whitespace-nowrap">
        <RelativeDateDisplay.Value value={row.original.createdAt} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'resolvedAt',
    accessorKey: 'resolvedAt',
    size: 130,
    minSize: 118,
    header: () => <RecordTable.InlineHead label={t('resolved')} />,
    cell: ({ row }) => (
      <RecordTableInlineCell className="whitespace-nowrap">
        {row.original.resolvedAt ? (
          <RelativeDateDisplay.Value value={row.original.resolvedAt} />
        ) : (
          '-'
        )}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'actions',
    size: 190,
    minSize: 160,
    header: () => <RecordTable.InlineHead label={t('actions')} />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <ApprovalNotificationActions
          request={row.original}
          onCompleted={onCompleted}
        />
      </RecordTableInlineCell>
    ),
  },
];
