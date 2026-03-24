import { IAutomation } from '@/automations/types';
import { Row } from '@tanstack/react-table';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { AutomationRemoveButtonCommandBar } from '@/automations/components/list/AutomationRemoveButtonCommandBar';

export const AutomationRecordTableCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  const automationIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row: Row<IAutomation>) => row.original._id);

  const isSelected = table.getFilteredSelectedRowModel().rows.length > 0;
  return (
    <CommandBar open={isSelected}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <AutomationRemoveButtonCommandBar
          automationIds={automationIds}
          rows={table.getFilteredSelectedRowModel().rows}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
