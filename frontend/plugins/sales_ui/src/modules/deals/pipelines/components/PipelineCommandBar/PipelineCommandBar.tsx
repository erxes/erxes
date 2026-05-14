import React from 'react';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { PipelineDelete } from './PipelineDelete';

export const PipelineCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  const pipelines = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);

  const isSelected = table.getFilteredSelectedRowModel().rows.length > 0;

  return (
    <CommandBar open={isSelected}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <PipelineDelete
          pipelines={pipelines}
          rows={table.getFilteredSelectedRowModel().rows}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
