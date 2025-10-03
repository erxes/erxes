import { LogUserInfo } from '@/logs/components/LogUser';
import { ILogDoc } from '@/logs/types';
import {
  IconCalendarTime,
  IconEye,
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
  Button,
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

export const logColumns: ColumnDef<ILogDoc>[] = [
  {
    id: 'detail',
    cell: ({ cell }) => {
      const [, setLogId] = useQueryState<string>('logId');
      return (
        <RecordTableInlineCell>
          <Button
            className="w-full"
            variant="ghost"
            size="icon"
            onClick={() => setLogId(cell.row.original._id)}
          >
            <IconEye />
          </Button>
        </RecordTableInlineCell>
      );
    },
    size: 33,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => (
      <RecordTable.InlineHead icon={IconInfoCircle} label="Status" />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue() as 'failed' | 'success';

      const { Icon, variant } = statusInfos[status] || {};

      return (
        <RecordTableInlineCell>
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
