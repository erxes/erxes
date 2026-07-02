import { IconAlignLeft, IconCalendarPlus, IconHash, IconQrcode } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { IInvoice } from '~/modules/payment/types/Payment';

export const invoicesColumns = (
  t: (key: string, defaultValue?: string) => string,
): ColumnDef<IInvoice>[] => [
  RecordTable.checkboxColumn as ColumnDef<IInvoice>,
  {
    id: 'invoiceNumber',
    accessorKey: 'invoiceNumber',
    header: () => {
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
      return <RecordTable.InlineHead label={t('description', 'Description')} icon={IconHash} />;
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
      return <RecordTable.InlineHead label={t('amount', 'Amount')} icon={IconHash} />;
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
      return <RecordTable.InlineHead label={t('currency', 'Currency')} icon={IconHash} />;
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
      return <RecordTable.InlineHead label={t('scanned', 'Scanned')} icon={IconQrcode} />;
    },
    cell: ({ cell }) => {
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
      return <RecordTable.InlineHead label={t('date-created', 'Date created')} icon={IconCalendarPlus} />;
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
