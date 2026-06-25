import {
  IconCategory,
  IconCurrencyDollar,
  IconHash,
  IconLabel,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { byDateMoreColumn } from '~/modules/ebarimt/put-response/put-responses-by-date/components/ByDateMoreColumn';
import { IByDate } from '~/modules/ebarimt/put-response/put-responses-by-date/types/ByDateType';
export const ByDateColumns: ColumnDef<IByDate>[] = [
  byDateMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IByDate>,
  {
    id: 'date',
    accessorKey: 'date',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconHash} label={t('date')} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'values.counter',
    accessorKey: 'values.counter',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconLabel} label={t('count')} />;
    },
    cell: ({ row }) => {
      const counter = row.original.values?.counter || 0;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={String(counter)} />
        </RecordTableInlineCell>
      );
    },
  },

  {
    id: 'values.cityTax',
    accessorKey: 'values.cityTax',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconCurrencyDollar} label={t('city-tax')} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'values.vat',
    accessorKey: 'values.vat',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconUser} label={t('vat')} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'values.amount',
    accessorKey: 'values.amount',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconCategory} label={t('amount')} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
];
