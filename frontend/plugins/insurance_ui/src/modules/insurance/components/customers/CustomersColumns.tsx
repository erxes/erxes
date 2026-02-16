import {
  IconUser,
  IconMail,
  IconPhone,
  IconBuilding,
  IconId,
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
import {
  createEntityMoreColumn,
  createTextColumn,
  createDateColumn,
} from '../shared';

// Custom fullName column for customers
const fullNameColumn: ColumnDef<InsuranceCustomer> = {
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
};

// Custom type column with badge
const typeColumn: ColumnDef<InsuranceCustomer> = {
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
};

export const customersColumns: ColumnDef<InsuranceCustomer>[] = [
  createEntityMoreColumn<InsuranceCustomer>(CustomersMoreColumn, 26),
  RecordTable.checkboxColumn as ColumnDef<InsuranceCustomer>,
  fullNameColumn,
  typeColumn,
  createTextColumn<InsuranceCustomer>(
    'registrationNumber',
    'registrationNumber',
    IconId,
    'Registration No.',
  ),
  createTextColumn<InsuranceCustomer>('email', 'email', IconMail, 'Email'),
  createTextColumn<InsuranceCustomer>('phone', 'phone', IconPhone, 'Phone'),
  createTextColumn<InsuranceCustomer>(
    'companyName',
    'companyName',
    IconBuilding,
    'Company Name',
  ),
  createDateColumn<InsuranceCustomer>('createdAt', 'createdAt', 'Created Date'),
];
