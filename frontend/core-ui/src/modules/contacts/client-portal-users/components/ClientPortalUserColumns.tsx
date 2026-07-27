import {
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconMail,
  IconPhone,
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
import { clientPortalUserMoreColumn } from '@/contacts/client-portal-users/components/ClientPortalUserMoreColumn';

function displayName(user: ICPUser) {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length) return parts.join(' ');
  return user.email || user.phone || user.username || '-';
}

export const clientPortalUserColumns = (
  t: (key: string, defaultValue: string) => string,
): ColumnDef<ICPUser>[] => [
  clientPortalUserMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ICPUser>,
  {
    id: 'name',
    accessorKey: 'firstName',
    header: () => {
      return <RecordTable.InlineHead icon={IconUser} label={t('customer.name', 'Name')} />;
    },
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
    header: () => {
      return <RecordTable.InlineHead icon={IconMail} label={t('customer.add.email', 'Email')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: () => {
      return <RecordTable.InlineHead icon={IconPhone} label={t('customer.add.phone', 'Phone')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: () => {
      return <RecordTable.InlineHead icon={IconUser} label={t('clientPortalUser.detail.type', 'Type')} />;
    },
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
    header: () => {
      return <RecordTable.InlineHead icon={IconBuilding} label={t('clientPortalUser.detail.company', 'Company')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'clientPortal',
    accessorKey: 'clientPortal',
    header: () => {
      return <RecordTable.InlineHead icon={IconWorld} label={t('clientPortal', 'Client portal')} />;
    },
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
    header: () => {
      return <RecordTable.InlineHead icon={IconCheck} label={t('verified', 'Verified')} />;
    },
    cell: ({ cell }) => {
      const isVerified = cell.getValue() as boolean;
      return (
        <RecordTableInlineCell>
          <Badge variant={isVerified ? 'success' : 'secondary'}>
            {isVerified ? t('yes', 'Yes') : t('no', 'No')}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => {
      return <RecordTable.InlineHead icon={IconCalendar} label={t('clientPortalUser.detail.created', 'Created')} />;
    },
    cell: ({ cell }) => (
      <RelativeDateDisplay value={cell.getValue() as string} asChild>
        <RecordTableInlineCell>
          <RelativeDateDisplay.Value value={cell.getValue() as string} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
  },
];
