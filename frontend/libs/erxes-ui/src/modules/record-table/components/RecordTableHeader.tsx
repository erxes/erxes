import {
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';
import { flexRender, Header } from '@tanstack/react-table';

import { Table } from 'erxes-ui/components';
import { isStructuralColumn } from 'erxes-ui/modules/record-table/utils/columnUtils';

import { RecordTableHead } from './RecordTableHead';
import { RecordTableColumnSelector } from './RecordTableColumnSelector';
import { useRecordTable } from './RecordTableProvider';

const SELECTOR_WIDTH = 32;

const resolveSelectorSlot = (visibleHeaders: Header<any, unknown>[]) => {
  let offset = 0;

  for (const header of visibleHeaders) {
    const tooNarrow = header.getSize() < SELECTOR_WIDTH * 2;

    if (!isStructuralColumn(header.column.id) && !tooNarrow) {
      return { offset, coveredId: header.id };
    }

    offset += header.getSize();
  }

  return { offset: 0, coveredId: visibleHeaders[0]?.id };
};

export const RecordTableHeader = ({
  showColumnSelector = false,
}: {
  showColumnSelector?: boolean;
}) => {
  const { table } = useRecordTable();
  return (
    <Table.Header>
      {table.getHeaderGroups().map((headerGroup) => {
        const visibleHeaders = headerGroup.headers.filter(
          (header) => !header.isPlaceholder,
        );
        const { offset, coveredId } = resolveSelectorSlot(visibleHeaders);
        const anchorId = visibleHeaders[0]?.id;

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
                const isAnchor = showColumnSelector && header.id === anchorId;
                const isCovered = showColumnSelector && header.id === coveredId;

                return (
                  <RecordTableHead
                    header={header}
                    key={header.id}
                    className={isAnchor ? 'z-4' : undefined}
                  >
                    {isCovered ? (
                      <div className="pl-8">{headerContent}</div>
                    ) : (
                      headerContent
                    )}
                    {isAnchor && (
                      <div
                        className="absolute top-0 z-20 h-full w-8 border-r bg-sidebar"
                        style={{ left: `${offset}px` }}
                      >
                        <RecordTableColumnSelector />
                      </div>
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
