import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { flexRender } from '@tanstack/react-table';

import { Table } from 'erxes-ui/components/table';
import { isStructuralColumn } from 'erxes-ui/modules/record-table/utils/columnUtils';

import { RecordTableHead } from './RecordTableHead';
import { RecordTableColumnSelector } from './RecordTableColumnSelector';
import {
  useRecordTable,
  useRecordTableState,
  type RecordTableInstance,
} from './RecordTableProvider';

const SELECTOR_WIDTH = 32;

/**
 * Where the column selector sits: over the first content column wide enough to hold it, after
 * the structural and narrow columns before it. Sizes change while a column is resized.
 */
const selectorSlot = (table: RecordTableInstance) => {
  const headers = (table.getHeaderGroups().at(-1)?.headers ?? []).filter(
    (header) => !header.isPlaceholder,
  );

  let offset = 0;

  for (const header of headers) {
    const tooNarrow = header.getSize() < SELECTOR_WIDTH * 2;

    if (!isStructuralColumn(header.column.id) && !tooNarrow) {
      return { offset, coveredId: header.id, anchorId: headers[0]?.id };
    }

    offset += header.getSize();
  }

  return { offset: 0, coveredId: headers[0]?.id, anchorId: headers[0]?.id };
};

export const RecordTableHeader = ({
  showColumnSelector = false,
}: {
  showColumnSelector?: boolean;
}) => {
  const { table } = useRecordTable();
  const headerGroups = table.getHeaderGroups();
  const columnOrder = useRecordTableState((state) => state.columnOrder);
  const slot = useRecordTableState((_state, current) => selectorSlot(current));
  const leafGroupId = headerGroups.at(-1)?.id;

  return (
    <Table.Header>
      {headerGroups.map((headerGroup) => {
        const selector = showColumnSelector && headerGroup.id === leafGroupId;

        return (
          <Table.Row key={headerGroup.id}>
            <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
              {headerGroup.headers.map((header) => {
                const headerContent = header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext());

                const isAnchor = selector && header.id === slot.anchorId;
                const isCovered = selector && header.id === slot.coveredId;

                return (
                  <RecordTableHead
                    header={header}
                    pinned={header.column.getIsPinned() === 'start'}
                    key={header.id}
                    className={isAnchor ? 'z-4' : undefined}
                  >
                    {isCovered ? <div className="pl-8">{headerContent}</div> : headerContent}
                    {isAnchor && (
                      <div
                        className="absolute top-0 left-(--selector-left) z-20 h-full w-8 border-r bg-sidebar"
                        style={{ '--selector-left': `${slot.offset}px` }}
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
