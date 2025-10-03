import { Row } from '@tanstack/table-core';
import { CommandBar, Separator } from 'erxes-ui/components';
import { RecordTable } from 'erxes-ui/modules/record-table';
import { ISegment } from 'ui-modules';
import { SegmentRemoveButtonCommandBar } from './SegmentsRemoveButton';

export const SegmentCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  const segmentIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row: Row<ISegment>) => row.original._id);

  const isSelected = table.getFilteredSelectedRowModel().rows.length > 0;

  return (
    <CommandBar open={isSelected}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <SegmentRemoveButtonCommandBar
          segmentIds={segmentIds}
          rows={table.getFilteredSelectedRowModel().rows}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
