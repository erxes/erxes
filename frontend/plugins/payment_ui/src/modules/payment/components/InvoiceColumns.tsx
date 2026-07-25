import { IconAlignLeft, IconCalendarPlus, IconHash, IconQrcode } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IInvoice } from '~/modules/payment/types/Payment';

export const invoicesColumns: ColumnDef<IInvoice>[] = [
  RecordTable.checkboxColumn as ColumnDef<IInvoice>,
  {
    id: 'invoiceNumber',
    accessorKey: 'invoiceNumber',
    header: () => {
      const { t } = useTranslation('payment');
      return <RecordTable.InlineHead label={t('invoice-number', 'Invoice number')} icon={IconAlignLeft} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <Badge>{cell.getValue() as string}</Badge>
        </RecordTableInlineCell>
      );
    },
    size: 250,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => {
      const { t } = useTranslation('payment');
      return <RecordTable.InlineHead label={t('description', 'description')} icon={IconHash} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
    size: 350,
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: () => {
      const { t } = useTranslation('payment');
      return <RecordTable.InlineHead label={t('amount', 'amount')} icon={IconHash} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'currency',
    accessorKey: 'currency',
    header: () => {
      const { t } = useTranslation('payment');
      return <RecordTable.InlineHead label={t('currency', 'currency')} icon={IconHash} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => {
      const { t } = useTranslation('payment');
      return <RecordTable.InlineHead label={t('status', 'Status')} icon={IconHash} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <Badge
            variant={
              (cell.getValue() as string) === 'paid' ? 'success' : 'destructive'
            }
          >
            {cell.getValue() as string}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'scannedAt',
    accessorKey: 'scannedAt',
    header: () => {
      const { t } = useTranslation('payment');
      return <RecordTable.InlineHead label={t('scanned', 'scanned')} icon={IconQrcode} />;
    },
    cell: ({ cell }) => {
      const { t } = useTranslation('payment');
      const scannedAt = cell.getValue() as string | undefined;
      return (
        <RecordTableInlineCell>
          {scannedAt ? (
            <RelativeDateDisplay value={scannedAt} asChild>
              <Badge variant="success">
                <RelativeDateDisplay.Value value={scannedAt} />
              </Badge>
            </RelativeDateDisplay>
          ) : (
            <Badge variant="outline">{t('not-scanned', 'Not scanned')}</Badge>
          )}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => {
      const { t } = useTranslation('payment');
      return <RecordTable.InlineHead label={t('date-created', 'Date Created')} icon={IconCalendarPlus} />;
    },
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell>
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
];
