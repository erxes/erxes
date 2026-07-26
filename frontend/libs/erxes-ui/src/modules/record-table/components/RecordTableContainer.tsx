import { CSSProperties, forwardRef, useMemo } from 'react';

import { Table } from '@tanstack/react-table';

import { cn } from 'erxes-ui/lib/utils';

const FIXED_WIDTH_COLUMNS = ['more', 'checkbox'];

interface RecordTableContainerProps {
  table: Table<any>;
  children: React.ReactNode;
}

const RecordTableContainer = forwardRef<
  HTMLDivElement,
  RecordTableContainerProps & React.HTMLAttributes<HTMLDivElement>
>(({ table, className, children, ...restProps }, ref) => {
  const { columnSizeVars, flexWidth } = useMemo(() => {
    const headers = table.getFlatHeaders();
    const flexWidth = headers.reduce(
      (total, header) =>
        FIXED_WIDTH_COLUMNS.includes(header.column.id)
          ? total
          : total + header.getSize(),
      0,
    );
    const colSizes: { [key: string]: number | string } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (header) {
        colSizes[`--header-${header.id}-size`] = header.getSize();
        colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
        const width =
          FIXED_WIDTH_COLUMNS.includes(header.column.id) || !flexWidth
            ? `${header.getSize()}px`
            : `${(header.getSize() / flexWidth) * 100}%`;
        colSizes[`--header-${header.id}-width`] = width;
        colSizes[`--col-${header.column.id}-width`] = width;
      }
    }
    return { columnSizeVars: colSizes, flexWidth };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    table.getState().columnSizingInfo,
    table.getState().columnSizing,
    table.getState().columnVisibility,
  ]);

  const totalWidth = table.getTotalSize() + 'px';

  return (
    <div
      ref={ref}
      {...restProps}
      style={
        {
          '--table-width': flexWidth ? `max(${totalWidth}, 100%)` : totalWidth,
          ...columnSizeVars,
        } as CSSProperties
      }
      className={cn(
        'grow-0 basis-full overflow-hidden rounded-lg bg-sidebar border-t-4 border-l-4 border-sidebar',
        className,
      )}
    >
      {children}
    </div>
  );
});

RecordTableContainer.displayName = 'RecordTableContainer';

export default RecordTableContainer;
