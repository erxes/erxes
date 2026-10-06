import { HeaderCell } from '@/check-synced/constants/HeaderCell';
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
    header: () => <HeaderCell icon={IconCalendar} labelKey="date" />,
    accessorKey: 'date',
    cell: ({ getValue }) => <DateCell value={getValue<Date>()} />,
  },
  {
    id: 'description',
    header: () => <HeaderCell icon={IconFile} labelKey="description" />,
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
    header: () => <HeaderCell icon={IconProgressCheck} labelKey="status" />,
    accessorKey: 'status',
    cell: ({ getValue }) => (
      <RecordTableInlineCell>{getValue<string>()}</RecordTableInlineCell>
    ),
  },
];
