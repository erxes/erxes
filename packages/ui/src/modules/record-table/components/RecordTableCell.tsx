import React, { createContext, use, useId } from 'react';

import { Table } from 'erxes-ui/components/table';
import { cn } from 'erxes-ui/lib/utils';
import { useRecordTable } from './RecordTableProvider';

/** The header cell id of the column a cell sits in, so its control is named by the column. */
export const CellColumnHead = createContext<string | undefined>(undefined);

/**
 * A cell control's id and name: the column head (or a side panel field's label), else the
 * control's own `aria-label`, then the text it shows ("Emails ada@…"), so an empty value is
 * still named and what it shows is always part of its name. Spread `control` before the
 * caller's props, which win, and wrap what it shows in a span with `textId`.
 */
export const useCellLabel = (id?: string, ariaLabel?: string) => {
  const ownId = useId();
  const textId = useId();
  const controlId = id ?? ownId;
  const head = use(CellColumnHead);
  // The control's own id stands for its aria-label in its labelledby list.
  const label = head ?? (ariaLabel ? controlId : undefined);

  return {
    control: { id: controlId, 'aria-labelledby': label ? `${label} ${textId}` : undefined },
    textId,
  };
};

/** A body cell. Its width and pinned offset are CSS variables the table container sets. */
export const RecordTableCell = ({
  ref,
  children,
  className,
  columnId,
  pinned,
  style,
  ...props
}: React.HTMLAttributes<HTMLTableCellElement> & {
  columnId: string;
  pinned: boolean;
} & React.RefAttributes<HTMLTableCellElement>) => {
  const { headId } = useRecordTable();

  return (
    <Table.Cell
      ref={ref}
      className={cn(
        'p-0 transition-colors isolate w-(--cell-width)',
        pinned && [
          'sticky z-1 left-(--cell-start)',
          'bg-background',
          'group-hover/table-row:bg-background',
          'group-data-[state=selected]/table-row:bg-background',
          'before:absolute before:inset-0 before:-z-1',
          'group-hover/table-row:before:bg-muted',
          'group-data-[state=selected]/table-row:before:bg-primary/10',
        ],
        className,
      )}
      style={{
        '--cell-width': `var(--col-${columnId}-width)`,
        '--cell-start': pinned ? `var(--col-${columnId}-start)` : undefined,
        ...style,
      }}
      {...props}
    >
      <CellColumnHead value={headId(columnId)}>{children}</CellColumnHead>
    </Table.Cell>
  );
};
