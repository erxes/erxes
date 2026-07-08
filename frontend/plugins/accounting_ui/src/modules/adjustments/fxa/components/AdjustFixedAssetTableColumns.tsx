import { ColumnDef } from '@tanstack/react-table';
import { IconCalendar, IconFile, IconProgressCheck } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { IAdjustFixedAsset } from '../types/AdjustFixedAsset';

const DateCell = ({ value }: { value?: Date }) => (
  <RecordTableInlineCell>
    {value ? dayjs(new Date(value)).format('YYYY-MM-DD') : '-'}
  </RecordTableInlineCell>
);

const MoreColumnCell = ({ row }: { row: { original: IAdjustFixedAsset } }) => (
  <Link to={`/accounting/adjustment/fxa/detail?id=${row.original._id}`}>
    <RecordTable.MoreButton className="w-full h-full" />
  </Link>
);

export const adjustFixedAssetTableColumns: ColumnDef<IAdjustFixedAsset>[] = [
  {
    id: 'more',
    cell: MoreColumnCell,
    size: 33,
  },
  {
    id: 'date',
    header: () => <RecordTable.InlineHead icon={IconCalendar} label="Огноо" />,
    accessorKey: 'date',
    cell: ({ getValue }) => <DateCell value={getValue<Date>()} />,
  },
  {
    id: 'description',
    header: () => <RecordTable.InlineHead icon={IconFile} label="Тайлбар" />,
    accessorKey: 'description',
    cell: ({ getValue }) => (
      <RecordTableInlineCell>
        {(getValue<string | undefined>() || '-').toString()}
      </RecordTableInlineCell>
    ),
    size: 300,
  },
  {
    id: 'status',
    header: () => (
      <RecordTable.InlineHead icon={IconProgressCheck} label="Төлөв" />
    ),
    accessorKey: 'status',
    cell: ({ getValue }) => (
      <RecordTableInlineCell>{getValue<string>()}</RecordTableInlineCell>
    ),
  },
];
