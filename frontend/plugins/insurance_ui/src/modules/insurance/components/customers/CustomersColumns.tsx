import {
  IconUser,
  IconMail,
  IconPhone,
  IconBuilding,
  IconId,
  IconCalendar,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  Badge,
} from 'erxes-ui';
import { InsuranceCustomer } from '~/modules/insurance/types';
import { CustomersMoreColumn } from './CustomersMoreColumn';

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('mn-MN');
};

export const customersColumns: ColumnDef<InsuranceCustomer>[] = [
  {
    id: 'more',
    accessorKey: 'more',
    header: '',
    cell: ({ cell }) => <CustomersMoreColumn cell={cell} />,
    size: 26,
  },
  RecordTable.checkboxColumn as ColumnDef<InsuranceCustomer>,
  {
    id: 'fullName',
    accessorKey: 'firstName',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Name" />,
    cell: ({ cell }) => {
      const customer = cell.row.original;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={`${customer.firstName} ${customer.lastName}`}
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: () => <RecordTable.InlineHead icon={IconBuilding} label="Type" />,
    cell: ({ cell }) => {
      const type = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          {type === 'company' ? (
            <Badge className="bg-blue-100 text-blue-800">Company</Badge>
          ) : (
            <Badge className="bg-green-100 text-green-800">Individual</Badge>
          )}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'registrationNumber',
    accessorKey: 'registrationNumber',
    header: () => (
      <RecordTable.InlineHead icon={IconId} label="Registration No." />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
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
          <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
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
          <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'companyName',
    accessorKey: 'companyName',
    header: () => (
      <RecordTable.InlineHead icon={IconBuilding} label="Company Name" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="Created Date" />
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
