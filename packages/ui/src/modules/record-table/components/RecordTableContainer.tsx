import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from 'erxes-ui/lib/utils';
import { isFixedWidthColumn } from '../utils/columnUtils';
import type { RecordTableInstance } from './RecordTableProvider';

/**
 * Column sizes, widths and pinned offsets as CSS variables, so resizing a column restyles the
 * table without rendering its rows. Fixed-width columns keep their pixel size and the rest
 * share the remaining width in proportion to their size.
 */
const columnSizeVariables = (table: RecordTableInstance) => {
  const headers = table.getFlatHeaders();

  const flexWidth = headers.reduce(
    (total, header) => (isFixedWidthColumn(header.column) ? total : total + header.getSize()),
    0,
  );

  const totalWidth = `${table.getTotalSize()}px`;

  const variables: Record<`--${string}`, string | number> = {
    '--table-width': flexWidth ? `max(${totalWidth}, 100%)` : totalWidth,
  };

  for (const header of headers) {
    const { column } = header;

    const width =
      isFixedWidthColumn(column) || !flexWidth
        ? `${header.getSize()}px`
        : `${(header.getSize() / flexWidth) * 100}%`;

    variables[`--header-${header.id}-width`] = width;
    variables[`--col-${column.id}-width`] = width;

    if (column.getIsPinned() === 'start') {
      variables[`--col-${column.id}-start`] = `${column.getStart('start')}px`;
    }
  }

  return variables;
};

/** Renders again whenever the table's options change, which includes every layout change. */
export const RecordTableContainer = ({
  table,
  className,
  children,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & { table: RecordTableInstance; children: ReactNode }) => (
  <div
    {...props}
    style={{ ...columnSizeVariables(table), ...style }}
    className={cn(
      'grow-0 basis-full overflow-hidden rounded-lg bg-sidebar border-t-4 border-l-4 border-sidebar',
      className,
    )}
  >
    {children}
  </div>
);
