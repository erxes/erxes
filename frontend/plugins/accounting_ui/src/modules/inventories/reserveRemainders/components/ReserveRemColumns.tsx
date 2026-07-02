import {
  IconBox,
  IconBuildingWarehouse,
  IconHierarchy2,
  IconRuler2,
  IconStack2,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  NumberField,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useReserveRemEdit } from '../hooks/useReserveRemEdit';
import { IReserveRem } from '../types/ReserveRem';
import { reserveRemMoreColumn } from './ReserveRemMoreColumn';

const RemainderField = ({ reserveRem }: { reserveRem: IReserveRem }) => {
  const { editReserveRem } = useReserveRemEdit();

  return (
    <NumberField
      value={reserveRem.remainder ?? 0}
      scope={`reserveRem-${reserveRem._id}-remainder`}
      onSave={(value) => {
        editReserveRem({
          variables: { _id: reserveRem._id, remainder: value },
        });
      }}
      className="shadow-none rounded-none px-2"
    />
  );
};

export const reserveRemColumns: ColumnDef<IReserveRem>[] = [
  reserveRemMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IReserveRem>,
  {
    id: 'product',
    accessorKey: 'product',
    header: () => <RecordTable.InlineHead icon={IconBox} label="Бараа" />,
    cell: ({ row }) => {
      const code = row.original.product?.code;
      const name = row.original.product?.name;
      const value = [code, name].filter(Boolean).join(' - ') || '';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value} />
        </RecordTableInlineCell>
      );
    },
    size: 320,
  },
  {
    id: 'branch',
    accessorKey: 'branch',
    header: () => (
      <RecordTable.InlineHead icon={IconBuildingWarehouse} label="Салбар" />
    ),
    cell: ({ row }) => {
      const code = row.original.branch?.code;
      const title = row.original.branch?.title;
      const value = [code, title].filter(Boolean).join(' - ') || '';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value} />
        </RecordTableInlineCell>
      );
    },
    size: 240,
  },
  {
    id: 'department',
    accessorKey: 'department',
    header: () => (
      <RecordTable.InlineHead icon={IconHierarchy2} label="Хэлтэс" />
    ),
    cell: ({ row }) => {
      const code = row.original.department?.code;
      const title = row.original.department?.title;
      const value = [code, title].filter(Boolean).join(' - ') || '';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value} />
        </RecordTableInlineCell>
      );
    },
    size: 240,
  },
  {
    id: 'uom',
    accessorKey: 'uom',
    header: () => (
      <RecordTable.InlineHead icon={IconRuler2} label="Хэмжих нэгж" />
    ),
    cell: ({ getValue }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(getValue() as string) ?? ''} />
      </RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'remainder',
    accessorKey: 'remainder',
    header: () => (
      <RecordTable.InlineHead icon={IconStack2} label="Нөөц үлдэгдэл" />
    ),
    cell: ({ row }) => <RemainderField reserveRem={row.original} />,
    size: 160,
  },
];
