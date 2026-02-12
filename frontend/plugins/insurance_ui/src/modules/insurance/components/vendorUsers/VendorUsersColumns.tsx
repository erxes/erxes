import {
  IconUser,
  IconMail,
  IconPhone,
  IconBuilding,
  IconShield,
  IconCalendar,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  Badge,
} from 'erxes-ui';
import { VendorUser } from '~/modules/insurance/types';
import { VendorUsersMoreColumn } from './VendorUsersMoreColumn';

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('mn-MN');
};

export const createVendorUsersColumns = (
  onEdit: (user: VendorUser) => void,
  onRefetch: () => void,
): ColumnDef<VendorUser>[] => {
  return [
    {
      id: 'more',
      accessorKey: 'more',
      header: '',
      cell: ({ cell }) => (
        <VendorUsersMoreColumn
          cell={cell}
          onEdit={onEdit}
          onRefetch={onRefetch}
        />
      ),
      size: 32,
    },
    {
      ...(RecordTable.checkboxColumn as ColumnDef<VendorUser>),
      size: 32,
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: () => <RecordTable.InlineHead icon={IconUser} label="Name" />,
      cell: ({ cell }) => {
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip
              value={(cell.getValue() as string) || 'No name'}
            />
          </RecordTableInlineCell>
        );
      },
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: () => <RecordTable.InlineHead icon={IconMail} label="Email" />,
      cell: ({ cell }) => {
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
          </RecordTableInlineCell>
        );
      },
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      header: () => <RecordTable.InlineHead icon={IconPhone} label="Phone" />,
      cell: ({ cell }) => {
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
          </RecordTableInlineCell>
        );
      },
    },
    {
      id: 'vendor',
      accessorKey: 'vendor',
      header: () => (
        <RecordTable.InlineHead icon={IconBuilding} label="Vendor" />
      ),
      cell: ({ cell }) => {
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value={cell.row.original.vendor?.name || ''} />
          </RecordTableInlineCell>
        );
      },
    },
    {
      id: 'role',
      accessorKey: 'role',
      header: () => <RecordTable.InlineHead icon={IconShield} label="Role" />,
      cell: ({ cell }) => {
        const role = cell.getValue() as string;
        return (
          <RecordTableInlineCell>
            <Badge variant="secondary">{role}</Badge>
          </RecordTableInlineCell>
        );
      },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendar} label="Created At" />
      ),
      cell: ({ cell }) => {
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value={formatDate(cell.getValue() as Date)} />
          </RecordTableInlineCell>
        );
      },
    },
  ];
};
