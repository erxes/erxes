import { type HTMLAttributes } from 'react';
import { useInView } from 'react-intersection-observer';
import { Table } from 'erxes-ui/components/table';
import { cn, mergeRefs } from 'erxes-ui/lib/utils';
import { readRow } from '../utils/rowFields';
import { useRecordTableState } from './RecordTableProvider';

/**
 * A table row. It subscribes to its own selection, so selecting a row renders that row only.
 * With `handleRowViewChange`, it reports when it scrolls in and out of view.
 */
export const RecordTableRow = ({
  ref,
  children,
  className,
  handleRowViewChange,
  original,
  rowId,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & {
  handleRowViewChange?: (inView: boolean) => void;
  original?: unknown;
  rowId?: string;
} & React.RefAttributes<HTMLTableRowElement>) => {
  const { cursor, id } = readRow(original);
  const selected = useRecordTableState((state) => Boolean(rowId && state.rowSelection[rowId]));

  const { ref: inViewRef } = useInView({
    skip: !handleRowViewChange,
    onChange: handleRowViewChange,
  });

  return (
    <Table.Row
      data-state={selected ? 'selected' : undefined}
      {...props}
      ref={mergeRefs(ref, inViewRef)}
      className={cn('h-cell', className)}
      id={cursor ?? id}
    >
      {children}
    </Table.Row>
  );
};
