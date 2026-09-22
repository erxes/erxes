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
import { useTranslation } from 'react-i18next';
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
  header: () => {
    const { t } = useTranslation('insurance');
    return <RecordTable.InlineHead icon={IconUser} label={t('name')} />;
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
};

// Custom type column with badge
const typeColumn: ColumnDef<InsuranceCustomer> = {
  id: 'type',
  accessorKey: 'type',
  header: () => {
    const { t } = useTranslation('insurance');
    return <RecordTable.InlineHead icon={IconBuilding} label={t('type')} />;
  },
  cell: ({ cell }) => {
    const { t } = useTranslation('insurance');
    const type = cell.getValue() as string;
    return (
      <RecordTableInlineCell>
        {type === 'company' ? (
          <Badge className="bg-blue-100 text-blue-800">{t('company')}</Badge>
        ) : (
          <Badge className="bg-green-100 text-green-800">{t('individual')}</Badge>
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
    'registration-number',
  ),
  createTextColumn<InsuranceCustomer>('email', 'email', IconMail, 'email'),
  createTextColumn<InsuranceCustomer>('phone', 'phone', IconPhone, 'phone'),
  createTextColumn<InsuranceCustomer>(
    'companyName',
    'companyName',
    IconBuilding,
    'company-name',
  ),
  createDateColumn<InsuranceCustomer>('createdAt', 'createdAt', 'created-at'),
];
