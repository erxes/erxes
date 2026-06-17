import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import {
  IconHash,
  IconUser,
  IconMail,
  IconPhone,
  IconAlertTriangle,
} from '@tabler/icons-react';
import {
  ICustomerItem,
  CUSTOMER_STATUS_ICONS,
  CUSTOMER_STATUS_CLASSES,
  CUSTOMER_STATUS_LABELS,
} from '../types/checkCustomer';

export const checkCustomerColumns: ColumnDef<ICustomerItem>[] = [
  RecordTable.checkboxColumn as ColumnDef<ICustomerItem>,
  {
    id: 'status',
    accessorKey: 'status',
    header: () => (
      <RecordTable.InlineHead icon={IconAlertTriangle} label="Status" />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue() as ICustomerItem['status'];
      const Icon = CUSTOMER_STATUS_ICONS[status];
      const className = CUSTOMER_STATUS_CLASSES[status];
      const label = CUSTOMER_STATUS_LABELS[status];

      return (
        <RecordTableInlineCell className={className}>
          <Icon size={16} />
          <TextOverflowTooltip value={label} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'No',
    accessorKey: 'No',
    header: () => <RecordTable.InlineHead icon={IconHash} label="MSD Code" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'Name',
    accessorKey: 'Name',
    header: () => <RecordTable.InlineHead icon={IconUser} label="MSD Name" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'Phone_No',
    accessorKey: 'Phone_No',
    header: () => <RecordTable.InlineHead icon={IconPhone} label="MSD Phone" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'E_Mail',
    accessorKey: 'E_Mail',
    header: () => <RecordTable.InlineHead icon={IconMail} label="MSD Email" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconHash} label="Erxes Code" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'primaryPhone',
    accessorKey: 'primaryPhone',
    header: () => (
      <RecordTable.InlineHead icon={IconPhone} label="Erxes Phone" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'primaryEmail',
    accessorKey: 'primaryEmail',
    header: () => (
      <RecordTable.InlineHead icon={IconMail} label="Erxes Email" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'message',
    accessorKey: 'message',
    header: () => (
      <RecordTable.InlineHead icon={IconAlertTriangle} label="Message" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
  },
];
