import {
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconMail,
  IconPhone,
  IconTrash,
  IconUser,
  IconWorld,
} from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { ICPUser } from '@/contacts/client-portal-users/types/cpUser';
import { CPUserRowDeleteButton } from '@/contacts/client-portal-users/components/CPUserRowDeleteButton';

function displayName(user: ICPUser) {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length) return parts.join(' ');
  return user.email || user.phone || user.username || '-';
}

export const clientPortalUserColumns: ColumnDef<ICPUser>[] = [
  {
    id: 'name',
    accessorKey: 'firstName',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Name" />,
    cell: ({ cell }) => {
      const row = cell.row.original;
      const [, setCpUserId] = useQueryState<string>('cpUserId');
      return (
        <RecordTableInlineCell
          onClick={() => setCpUserId(row._id)}
          className="cursor-pointer"
        >
          <TextOverflowTooltip value={displayName(row)} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: () => <RecordTable.InlineHead icon={IconMail} label="Email" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: () => <RecordTable.InlineHead icon={IconPhone} label="Phone" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Type" />,
    cell: ({ cell }) => {
      const type = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          {type ? (
            <Badge variant="secondary">{type}</Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'companyName',
    accessorKey: 'companyName',
    header: () => (
      <RecordTable.InlineHead icon={IconBuilding} label="Company" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'clientPortal',
    accessorKey: 'clientPortal',
    header: () => (
      <RecordTable.InlineHead icon={IconWorld} label="Client portal" />
    ),
    cell: ({ cell }) => {
      const clientPortal = cell.getValue() as ICPUser['clientPortal'];
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={clientPortal?.name ?? '-'} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'isVerified',
    accessorKey: 'isVerified',
    header: () => <RecordTable.InlineHead icon={IconCheck} label="Verified" />,
    cell: ({ cell }) => {
      const isVerified = cell.getValue() as boolean;
      return (
        <RecordTableInlineCell>
          <Badge variant={isVerified ? 'success' : 'secondary'}>
            {isVerified ? 'Yes' : 'No'}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="Created" />
    ),
    cell: ({ cell }) => (
      <RelativeDateDisplay value={cell.getValue() as string} asChild>
        <RecordTableInlineCell>
          <RelativeDateDisplay.Value value={cell.getValue() as string} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
  },
  {
    id: 'actions',
    header: () => <RecordTable.InlineHead icon={IconTrash} label="" />,
    cell: ({ row }) => (
      <RecordTableInlineCell
        onClick={(e) => e.stopPropagation()}
        className="w-10"
      >
        <CPUserRowDeleteButton row={row.original} />
      </RecordTableInlineCell>
    ),
    size: 48,
  },
];
