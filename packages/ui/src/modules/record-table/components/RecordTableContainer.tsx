import type { HTMLAttributes, ReactNode } from 'react';
import type { Table } from '@tanstack/react-table';
import { cn } from 'erxes-ui/lib/utils';
import { isFixedWidthColumn } from '../utils/columnUtils';

/**
 * Column sizes and widths as CSS variables. Fixed-width columns keep their pixel size and the
 * rest share the remaining width in proportion to their size.
 */
const columnSizeVariables = (table: Table<unknown>) => {
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
    const width =
      isFixedWidthColumn(header.column) || !flexWidth
        ? `${header.getSize()}px`
        : `${(header.getSize() / flexWidth) * 100}%`;

    variables[`--header-${header.id}-size`] = header.getSize();
    variables[`--col-${header.column.id}-size`] = header.column.getSize();
    variables[`--header-${header.id}-width`] = width;
    variables[`--col-${header.column.id}-width`] = width;
  }

  return variables;
};

export const RecordTableContainer = ({
  table,
  className,
  children,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & { table: Table<unknown>; children: ReactNode }) => (
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
