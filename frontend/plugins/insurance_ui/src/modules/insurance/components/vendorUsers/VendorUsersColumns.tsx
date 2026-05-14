import {
  IconUser,
  IconMail,
  IconPhone,
  IconBuilding,
  IconShield,
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
import { createTextColumn, createCreatedAtColumn } from '../shared';

// Custom vendor column with nested accessor
const vendorColumn: ColumnDef<VendorUser> = {
  id: 'vendor',
  accessorKey: 'vendor',
  header: () => <RecordTable.InlineHead icon={IconBuilding} label="Vendor" />,
  cell: ({ cell }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={cell.row.original.vendor?.name || ''} />
    </RecordTableInlineCell>
  ),
};

// Custom role column with badge
const roleColumn: ColumnDef<VendorUser> = {
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
};

export const createVendorUsersColumns = (
  onEdit: (user: VendorUser) => void,
  onRefetch: () => void,
): ColumnDef<VendorUser>[] => {
  // More column with callbacks
  const moreColumn: ColumnDef<VendorUser> = {
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
  };

  return [
    moreColumn,
    { ...(RecordTable.checkboxColumn as ColumnDef<VendorUser>), size: 32 },
    createTextColumn<VendorUser>('name', 'name', IconUser, 'Name', 'No name'),
    createTextColumn<VendorUser>('email', 'email', IconMail, 'Email', ''),
    createTextColumn<VendorUser>('phone', 'phone', IconPhone, 'Phone', ''),
    vendorColumn,
    roleColumn,
    createCreatedAtColumn<VendorUser>(),
  ];
};
