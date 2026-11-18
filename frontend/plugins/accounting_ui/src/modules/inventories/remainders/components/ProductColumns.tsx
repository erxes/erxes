import type { TFunction } from 'i18next';
import {
  IconCategory,
  IconCurrencyDollar,
  IconHash,
  IconLabel,
} from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  CurrencyFormatedDisplay,
  CurrencyCode,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { isJsonObject } from '@/utils/graphql';
import { IRemainderProduct } from '@/inventories/remainders/types/productTypes';
import { selectedRemainderProductAtom } from '@/inventories/remainders/states/productDetailStates';

type TRemainderSummaryKey = 'remainder' | 'soonIn' | 'soonOut';

const readRemainderValue = (remainder: unknown, key: TRemainderSummaryKey) => {
  const value = isJsonObject(remainder) ? remainder[key] : undefined;
  return typeof value === 'number' || typeof value === 'string'
    ? String(value)
    : '';
};

export const productColumns: (
  t: TFunction<'accounting'>,
) => ColumnDef<IRemainderProduct>[] = (t) => [
  RecordTable.checkboxColumn as ColumnDef<IRemainderProduct>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconHash} label={t('code')} />,
    cell: ({ cell }) => (
      <ClickableCell cell={cell} value={cell.getValue() as string} />
    ),
    size: 120,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('name')} />,
    cell: ({ cell }) => (
      <ClickableCell cell={cell} value={cell.getValue() as string} />
    ),
    size: 250,
  },
  {
    id: 'shortName',
    accessorKey: 'shortName',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label={t('shortName')} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 180,
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: () => (
      <RecordTable.InlineHead icon={IconCategory} label={t('category')} />
    ),
    cell: ({ cell }) => {
      const value = cell.row.original.category?.name || '';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value} />
        </RecordTableInlineCell>
      );
    },
    size: 300,
  },
  {
    id: 'unitPrice',
    accessorKey: 'unitPrice',
    header: () => (
      <RecordTable.InlineHead
        icon={IconCurrencyDollar}
        label={t('unit-price')}
      />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <CurrencyFormatedDisplay
            currencyValue={{
              amountMicros: cell.getValue() as number,
              currencyCode: CurrencyCode.MNT,
            }}
          />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'uom',
    accessorKey: 'uom',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('uom')} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'remainder',
    accessorKey: 'remainder',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label={t('remainder')} />
    ),
    cell: ({ cell }) => (
      <ClickableCell
        cell={cell}
        value={readRemainderValue(cell.row.original.remainder, 'remainder')}
      />
    ),
    size: 150,
  },
  {
    id: 'soonIn',
    accessorKey: 'soonIn',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label={t('soonIn')} />
    ),
    cell: ({ cell }) => (
      <ClickableCell
        cell={cell}
        value={readRemainderValue(cell.row.original.remainder, 'soonIn')}
      />
    ),
    size: 150,
  },
  {
    id: 'soonOut',
    accessorKey: 'soonOut',
    header: () => (
      <RecordTable.InlineHead icon={IconLabel} label={t('soonOut')} />
    ),
    cell: ({ cell }) => (
      <ClickableCell
        cell={cell}
        value={readRemainderValue(cell.row.original.remainder, 'soonOut')}
      />
    ),
    size: 150,
  },
];

export const useOpenRemainderSheet = (
  cell: Cell<IRemainderProduct, unknown>,
) => {
  const setSelected = useSetAtom(selectedRemainderProductAtom);
  return () =>
    setSelected({
      productId: cell.row.original._id,
      productName: cell.row.original.name,
      productCode: cell.row.original.code,
      inventories: cell.row.original.inventories,
      remainder: cell.row.original.remainder,
    });
};

const ClickableCell = ({
  cell,
  value,
}: {
  cell: Cell<IRemainderProduct, unknown>;
  value: string | undefined;
}) => {
  const open = useOpenRemainderSheet(cell);
  return (
    <RecordTableInlineCell>
      <button
        type="button"
        className="cursor-pointer w-full text-left bg-transparent border-0 p-0"
        onClick={open}
        onKeyDown={(e) => e.key === 'Enter' && open()}
      >
        <TextOverflowTooltip value={value} />
      </button>
    </RecordTableInlineCell>
  );
};
