import { type HTMLAttributes } from 'react';
import { useInView } from 'react-intersection-observer';
import { composeRefs } from 'radix-ui/internal';
import { Table } from 'erxes-ui/components/table';
import { cn } from 'erxes-ui/lib/utils';
import { readRow } from '../utils/rowFields';
import { useRecordTable } from './RecordTableProvider';

/** Past this many rows, a row out of view renders as an empty placeholder cell. */
const VIRTUALIZE_AFTER = 200;

export const RecordTableRow = ({
  ref,
  children,
  className,
  handleRowViewChange,
  original,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & {
  handleRowViewChange?: (inView: boolean) => void;
  original?: unknown;
} & React.RefAttributes<HTMLTableRowElement>) => {
  const { table } = useRecordTable();
  const { cursor, id } = readRow(original);

  const { ref: inViewRef, inView } = useInView({
    onChange: handleRowViewChange,
  });

  return (
    <Table.Row
      {...props}
      ref={composeRefs(ref, inViewRef)}
      className={cn('h-cell', inView ? 'in-view' : 'out-of-view', className)}
      id={cursor ?? id}
    >
      {table.getRowModel().rows.length > VIRTUALIZE_AFTER && !inView ? (
        <td aria-hidden className="h-cell bg-background" colSpan={table.getAllColumns().length} />
      ) : (
        children
      )}
    </Table.Row>
  );
};
