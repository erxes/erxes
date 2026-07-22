import {
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';
import { flexRender } from '@tanstack/react-table';

import { Table } from 'erxes-ui/components';

import { RecordTableHead } from './RecordTableHead';
import { RecordTableColumnSelector } from './RecordTableColumnSelector';
import { useRecordTable } from './RecordTableProvider';

export const RecordTableHeader = ({
  showColumnSelector = false,
}: {
  showColumnSelector?: boolean;
}) => {
  const { table } = useRecordTable();
  return (
    <Table.Header>
      {table.getHeaderGroups().map((headerGroup) => {
        const firstHeaderId = headerGroup.headers.find(
          (header) => !header.isPlaceholder,
        )?.id;

        return (
          <Table.Row key={headerGroup.id}>
            <SortableContext
              items={table.getState().columnOrder}
              strategy={horizontalListSortingStrategy}
            >
              {headerGroup.headers.map((header) => {
                const headerContent = header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    );
                const hasColumnSelector =
                  showColumnSelector && header.id === firstHeaderId;

                return (
                  <RecordTableHead header={header} key={header.id}>
                    {hasColumnSelector ? (
                      <>
                        <div className="pl-8">{headerContent}</div>
                        <div className="absolute left-0 top-0 z-20 h-full w-8 border-r bg-sidebar">
                          <RecordTableColumnSelector />
                        </div>
                      </>
                    ) : (
                      headerContent
                    )}
                  </RecordTableHead>
                );
              })}
            </SortableContext>
          </Table.Row>
        );
      })}
    </Table.Header>
  );
};
