import { ReactNode, useEffect, useRef } from 'react';
import { cn, RecordTable, Table } from 'erxes-ui';

export const SettingsRecordTableAddRow = ({
  children,
  columnId = 'name',
}: {
  children: ReactNode;
  columnId?: string;
}) => {
  const { table } = RecordTable.useRecordTable();
  const rowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      rowRef.current
        ?.closest('[data-radix-scroll-area-viewport]')
        ?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Table.Row ref={rowRef} className="h-cell">
      {table.getVisibleLeafColumns().map((column) => (
        <Table.Cell
          key={column.id}
          className={cn(
            'p-0 border-t',
            column.getIsPinned() && 'sticky z-1 bg-background',
          )}
          style={{
            width: `var(--col-${column.id}-width)`,
            left:
              column.getIsPinned() === 'left'
                ? `${column.getStart('left')}px`
                : undefined,
          }}
        >
          {column.id === columnId && (
            <div className="flex items-center h-full px-1">{children}</div>
          )}
        </Table.Cell>
      ))}
    </Table.Row>
  );
};
