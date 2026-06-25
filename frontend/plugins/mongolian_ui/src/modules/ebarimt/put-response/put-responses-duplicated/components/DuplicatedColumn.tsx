import {
  IconCategory,
  IconCurrencyDollar,
  IconHash,
  IconLabel,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import { duplicatedMoreColumn } from '~/modules/ebarimt/put-response/put-responses-duplicated/components/DuplicatedMoreColumn';
import { IDuplicated } from '~/modules/ebarimt/put-response/put-responses-duplicated/types/DuplicatedType';
import { HeaderCell } from '~/modules/ebarimt/put-response/components/HeaderCell';

export const DuplicatedColumns: ColumnDef<IDuplicated>[] = [
  duplicatedMoreColumn,
  {
    id: 'date',
    accessorKey: 'date',
    header: () => <HeaderCell icon={IconHash} label="date" />,
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
    header: () => <HeaderCell icon={IconLabel} label="count" />,
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
    header: () => <HeaderCell icon={IconCurrencyDollar} label="city-tax" />,
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
    header: () => <HeaderCell icon={IconUser} label="vat" />,
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
    header: () => <HeaderCell icon={IconCategory} label="amount" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
];
