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
import { useTranslation } from 'react-i18next';
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
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconAlertTriangle} label={t('status')} />;
    },
    cell: ({ cell }) => {
      const { t } = useTranslation('mongolian');
      const status = cell.getValue() as ICustomerItem['status'];
      const Icon = CUSTOMER_STATUS_ICONS[status];
      const className = CUSTOMER_STATUS_CLASSES[status];
      const label = CUSTOMER_STATUS_LABELS[status];

      return (
        <RecordTableInlineCell className={className}>
          <Icon size={16} />
          <TextOverflowTooltip value={t(label)} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'No',
    accessorKey: 'No',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconHash} label={t('msd-code')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'Name',
    accessorKey: 'Name',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconUser} label={t('msd-name')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'Phone_No',
    accessorKey: 'Phone_No',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconPhone} label={t('msd-phone')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'E_Mail',
    accessorKey: 'E_Mail',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconMail} label={t('msd-email')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconHash} label={t('erxes-code')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'primaryPhone',
    accessorKey: 'primaryPhone',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconPhone} label={t('erxes-phone')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'primaryEmail',
    accessorKey: 'primaryEmail',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconMail} label={t('erxes-email')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'message',
    accessorKey: 'message',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconAlertTriangle} label={t('message')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
  },
];
