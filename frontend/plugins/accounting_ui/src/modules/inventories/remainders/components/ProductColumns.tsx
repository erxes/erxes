import {
  IconCategory,
  IconCurrencyDollar,
  IconHash,
  IconLabel,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  CurrencyFormatedDisplay,
  CurrencyCode,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { IProduct } from 'ui-modules';
import { selectedRemainderProductAtom } from '../states/productDetailStates';

export const productColumns: (
  t: (key: string) => string,
) => ColumnDef<IProduct>[] = (t) => [
  RecordTable.checkboxColumn as ColumnDef<IProduct>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconHash} label={t('code')} />,
    cell: ({ cell }: { cell: any }) => (
      <ClickableCell cell={cell} value={cell.getValue() as string} />
    ),
    size: 120,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('name')} />,
    cell: ({ cell }: { cell: any }) => (
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
    cell: ({ cell }: { cell: any }) => {
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
    cell: ({ cell }: { cell: any }) => {
      const code = cell.row.original?.category?.code;
      const name = cell.row.original?.category?.name;
      const value = [code, name].filter(Boolean).join(' - ') || '';
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
    cell: ({ cell }: { cell: any }) => {
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
    cell: ({ cell }: { cell: any }) => {
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
    cell: ({ cell }: { cell: any }) => (
      <ClickableCell
        cell={cell}
        value={String(cell.row.original?.remainder?.remainder ?? '')}
      />
    ),
    size: 150,
  },
];

export const useOpenRemainderSheet = (cell: any) => {
  const setSelected = useSetAtom(selectedRemainderProductAtom);
  return () =>
    setSelected({
      productId: cell.row.original?._id,
      productName: cell.row.original?.name,
      productCode: cell.row.original?.code,
      inventories: cell.row.original?.inventories,
      remainder: cell.row.original?.remainder,
    });
};

const ClickableCell = ({
  cell,
  value,
}: {
  cell: any;
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
