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
import { TFunction } from 'i18next';
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

export const clientPortalUserColumns = (t: TFunction): ColumnDef<ICPUser>[] => [
  clientPortalUserMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ICPUser>,
  {
    id: 'name',
    accessorKey: 'firstName',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('name')} />,
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
    header: () => <RecordTable.InlineHead icon={IconMail} label={t('email')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: () => (
      <RecordTable.InlineHead icon={IconPhone} label={t('phone')} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('type')} />,
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
      <RecordTable.InlineHead icon={IconBuilding} label={t('company')} />
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
      <RecordTable.InlineHead icon={IconWorld} label={t('client-portal')} />
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
    header: () => (
      <RecordTable.InlineHead icon={IconCheck} label={t('verified')} />
    ),
    cell: ({ cell }) => {
      const isVerified = cell.getValue() as boolean;
      return (
        <RecordTableInlineCell>
          <Badge variant={isVerified ? 'success' : 'secondary'}>
            {isVerified ? t('yes') : t('no')}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label={t('created')} />
    ),
    cell: ({ cell }) => (
      <RelativeDateDisplay value={cell.getValue() as string} asChild>
        <RecordTableInlineCell>
          <RelativeDateDisplay.Value value={cell.getValue() as string} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
  },
];
