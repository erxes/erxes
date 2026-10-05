import { LogUserInfo } from '@/logs/components/LogUser';
import { ILogDoc } from '@/logs/types';
import {
  IconCalendarTime,
  IconCode,
  IconHash,
  IconInfoCircle,
  IconProgressCheck,
  IconProgressX,
  IconSettings,
  IconSourceCode,
  IconStack2,
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

// Clicking an id narrows the list to that object's history or that request's cascade.
const LogIdFilterCell = ({
  value,
  queryKey,
  label,
  count,
}: {
  value?: string;
  queryKey: 'docId' | 'processId';
  label: string;
  count?: number;
}) => {
  const [, setFilter] = useQueryState<string>(queryKey);

  if (!value) {
    return (
      <RecordTableInlineCell>
        <span className="text-muted-foreground">-</span>
      </RecordTableInlineCell>
    );
  }

  return (
    <RecordTableInlineCell onClick={() => setFilter(value)}>
      <span className="text-sm text-primary hover:underline cursor-pointer">
        {label}
        {count ? ` (${count})` : ''}
      </span>
    </RecordTableInlineCell>
  );
};

const generateUserName = (user: IUser | undefined) => {
  if (!user) return '';

  if (user?.details?.fullName) {
    return user.details.fullName;
  }

  return user.email || '';
};

export const logColumns: ColumnDef<ILogDoc>[] = [
  {
    id: 'status',
    accessorKey: 'status',
    header: () => (
      <RecordTable.InlineHead icon={IconInfoCircle} label="Status" />
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
      <RecordTable.InlineHead icon={IconCalendarTime} label="Created At" />
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
      <RecordTable.InlineHead icon={IconSourceCode} label="Source" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'action',
    accessorKey: 'action',
    header: () => <RecordTable.InlineHead icon={IconSettings} label="Action" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconCode} label="Operation" />,
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
    id: 'docId',
    accessorKey: 'docId',
    header: () => <RecordTable.InlineHead icon={IconHash} label="Object" />,
    cell: ({ cell }) => (
      <LogIdFilterCell
        value={cell.getValue() as string | undefined}
        queryKey="docId"
        label="View history"
        count={cell.row.original.docLogCount}
      />
    ),
  },
  {
    id: 'processId',
    accessorKey: 'processId',
    header: () => <RecordTable.InlineHead icon={IconStack2} label="Process" />,
    cell: ({ cell }) => (
      <LogIdFilterCell
        value={cell.getValue() as string | undefined}
        queryKey="processId"
        label="View process"
        count={cell.row.original.processLogCount}
      />
    ),
  },
  {
    id: 'userId',
    accessorKey: 'userId',
    header: () => <RecordTable.InlineHead icon={IconUser} label="User" />,
    cell: ({ cell }) => {
      const { user, userId } = cell?.row?.original || {};
      if (!user) {
        return (
          <RecordTableInlineCell className="text-border">
            No User
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
