import {
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';
import { flexRender } from '@tanstack/react-table';

import { Table } from 'erxes-ui/components';

import { RecordTableHead } from './RecordTableHead';
import { useRecordTable } from './RecordTableProvider';

export const RecordTableHeader = () => {
  const { table } = useRecordTable();
  return (
    <Table.Header>
      {table.getHeaderGroups().map((headerGroup) => (
        <Table.Row key={headerGroup.id}>
          <SortableContext
            items={table.getState().columnOrder}
            strategy={horizontalListSortingStrategy}
          >
            {headerGroup.headers.map((header) => (
              <RecordTableHead header={header} key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </RecordTableHead>
            ))}
          </SortableContext>
        </Table.Row>
      ))}
    </Table.Header>
  );
};
