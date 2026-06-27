import { ColumnDef } from '@tanstack/react-table';
import { RecordTable } from 'erxes-ui';

type DateCellProps = {
  date: string | number | Date | null | undefined;
};

const formatDate = (date: DateCellProps['date']) => {
  const parsedDate =
    date instanceof Date
      ? date
      : typeof date === 'string' || typeof date === 'number'
        ? new Date(date)
        : null;

  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function DateCell({ date }: DateCellProps) {
  return (
    <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
      {formatDate(date)}
    </div>
  );
}

export const dateColumn = <TData extends object = object>(
  header: string,
  accessorKey: string,
): ColumnDef<TData> => ({
  id: accessorKey,
  header: () => <RecordTable.InlineHead label={header} />,
  accessorKey,
  cell: ({ cell }) => (
    <DateCell
      date={cell.getValue<string | number | Date | null | undefined>()}
    />
  ),
  size: 180,
});
