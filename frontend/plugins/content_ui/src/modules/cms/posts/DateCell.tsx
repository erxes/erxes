import { ColumnDef } from '@tanstack/react-table';
import { RecordTable } from 'erxes-ui';

type DateCellProps = {
  date: string;
};

export function DateCell({ date }: DateCellProps) {
  return (
    <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
      {new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })}
    </div>
  );
}

export const dateColumn = (
  header: string,
  accessorKey: string,
): ColumnDef<any> => ({
  id: accessorKey,
  header: () => <RecordTable.InlineHead label={header} />,
  accessorKey,
  cell: ({ cell }) => <DateCell date={cell.getValue() as string} />,
  size: 180,
});
