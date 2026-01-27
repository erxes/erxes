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
import { duplicatedMoreColumn } from '~/modules/ebarimt/put-response/put-responses-duplicated/components/DuplicatedMoreColumn';
import { IDuplicated } from '~/modules/ebarimt/put-response/put-responses-duplicated/types/DuplicatedType';
export const DuplicatedColumns: ColumnDef<IDuplicated>[] = [
  duplicatedMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IDuplicated>,
  {
    id: 'date',
    accessorKey: 'date',
    header: () => <RecordTable.InlineHead icon={IconHash} label="Date" />,
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
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Count" />,
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
    header: () => (
      <RecordTable.InlineHead icon={IconCurrencyDollar} label="City Tax" />
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
    id: 'values.vat',
    accessorKey: 'values.vat',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Vat" />,
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
    header: () => <RecordTable.InlineHead icon={IconCategory} label="Amount" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
];
