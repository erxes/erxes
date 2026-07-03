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
const fullNameColumn = (
  t: (key: string, defaultValue?: string) => string,
): ColumnDef<InsuranceCustomer> => ({
  id: 'fullName',
  accessorKey: 'firstName',
  header: () => {
    return <RecordTable.InlineHead icon={IconUser} label={t('name', 'Name')} />;
  },
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
});

// Custom type column with badge
const typeColumn = (
  t: (key: string, defaultValue?: string) => string,
): ColumnDef<InsuranceCustomer> => ({
  id: 'type',
  accessorKey: 'type',
  header: () => {
    return (
      <RecordTable.InlineHead icon={IconBuilding} label={t('type', 'Type')} />
    );
  },
  cell: ({ cell }) => {
    const type = cell.getValue() as string;
    return (
      <RecordTableInlineCell>
        {type === 'company' ? (
          <Badge className="bg-blue-100 text-blue-800">
            {t('company', 'Company')}
          </Badge>
        ) : (
          <Badge className="bg-green-100 text-green-800">
            {t('individual', 'Individual')}
          </Badge>
        )}
      </RecordTableInlineCell>
    );
  },
});

export const customersColumns = (
  t: (key: string, defaultValue?: string) => string,
): ColumnDef<InsuranceCustomer>[] => [
  createEntityMoreColumn<InsuranceCustomer>(CustomersMoreColumn, 26),
  RecordTable.checkboxColumn as ColumnDef<InsuranceCustomer>,
  fullNameColumn(t),
  typeColumn(t),
  createTextColumn<InsuranceCustomer>(
    t,
    'registrationNumber',
    'registrationNumber',
    IconId,
    'registration-number',
  ),
  createTextColumn<InsuranceCustomer>(t, 'email', 'email', IconMail, 'email'),
  createTextColumn<InsuranceCustomer>(t, 'phone', 'phone', IconPhone, 'phone'),
  createTextColumn<InsuranceCustomer>(
    t,
    'companyName',
    'companyName',
    IconBuilding,
    'company-name',
  ),
  createDateColumn<InsuranceCustomer>(
    t,
    'createdAt',
    'createdAt',
    'created-at',
  ),
];
