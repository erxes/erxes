import { CSSProperties, forwardRef, useMemo } from 'react';

import { Table } from '@tanstack/react-table';

import { cn } from 'erxes-ui/lib/utils';

interface RecordTableContainerProps {
  table: Table<any>;
  children: React.ReactNode;
}

const RecordTableContainer = forwardRef<
  HTMLDivElement,
  RecordTableContainerProps & React.HTMLAttributes<HTMLDivElement>
>(({ table, className, children, ...restProps }, ref) => {
  const columnSizeVars = useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes: { [key: string]: number } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (header) {
        colSizes[`--header-${header.id}-size`] = header.getSize();
        colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
      }
    }
    return colSizes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.getState().columnSizingInfo, table.getState().columnSizing]);

  return (
    <div
      ref={ref}
      {...restProps}
      style={
        {
          '--table-width': table.getTotalSize() + 'px',
          ...columnSizeVars,
        } as CSSProperties
      }
      className={cn(
        'flex-grow-0 basis-full overflow-hidden rounded-lg bg-sidebar border-t-4 border-l-4 border-sidebar',
        className,
      )}
    >
      {children}
    </div>
  );
});

RecordTableContainer.displayName = 'RecordTableContainer';

export default RecordTableContainer;
