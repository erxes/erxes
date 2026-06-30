import { LogUserInfo } from '@/logs/components/LogUser';
import { ILogDoc } from '@/logs/types';
import {
  IconCalendarTime,
  IconCode,
  IconInfoCircle,
  IconProgressCheck,
  IconProgressX,
  IconSettings,
  IconSourceCode,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import dayjs from 'dayjs';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  useQueryState,
} from 'erxes-ui';
import { IUser } from 'ui-modules';

const statusInfos = {
  success: {
    variant: 'success',
    Icon: IconProgressCheck,
  },
  failed: {
    variant: 'destructive',
    Icon: IconProgressX,
  },
};

const generateUserName = (user: IUser | undefined) => {
  if (!user) return '';

  if (user?.details?.fullName) {
    return user.details.fullName;
  }

  return user.email || '';
};

export const logColumns = (t: (key: string) => string): ColumnDef<ILogDoc>[] => [
  {
    id: 'status',
    accessorKey: 'status',
    header: () => (
      <RecordTable.InlineHead icon={IconInfoCircle} label={t('logs.status')} />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue() as 'failed' | 'success';
      const [, setLogId] = useQueryState<string>('logId');

      const { Icon, variant } = statusInfos[status] || {};

      return (
        <RecordTableInlineCell onClick={() => setLogId(cell.row.original._id)}>
          <Badge variant={variant as 'success' | 'destructive'}>
            <Icon className="size-4" />
            {status}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendarTime} label={t('logs.created-at')} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <RelativeDateDisplay.Value
          value={dayjs(cell.getValue() as string).format('YYYY-MM-DD HH:mm:ss')}
        />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'source',
    accessorKey: 'source',
    header: () => (
      <RecordTable.InlineHead icon={IconSourceCode} label={t('logs.source')} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'action',
    accessorKey: 'action',
    header: () => <RecordTable.InlineHead icon={IconSettings} label={t('logs.action')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconCode} label={t('logs.operation')} />,
    cell: ({ cell }) => {
      const name = cell.getValue() as string | undefined;
      return (
        <RecordTableInlineCell>
          {name ? (
            <span className="font-mono text-sm" title={name}>
              {name}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'userId',
    accessorKey: 'userId',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('logs.user')} />,
    cell: ({ cell }) => {
      const { user, userId } = cell?.row?.original || {};
      if (!user) {
        return (
          <RecordTableInlineCell className="text-border">
            {t('logs.no-user')}
          </RecordTableInlineCell>
        );
      }
      const { details } = user || {};
      const fullName = details?.fullName || '';
      const initials = fullName ? fullName.charAt(0).toUpperCase() : '';

      return (
        <RecordTableInlineCell>
          {user && <LogUserInfo user={user} />}
        </RecordTableInlineCell>
      );
    },
  },
];
