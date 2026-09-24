import {
  AutomationStatusBadge,
  AutomationStatusToggle,
  useAutomationStatusToggle,
} from '@/automations/components/list/AutomationStatusToggle';
import {
  AutomationsHotKeyScope,
  TAutomationRecordTableColumnDefData,
} from '@/automations/types';
import { Cell } from '@tanstack/table-core';
import { PopoverScoped, RecordTableInlineCell } from 'erxes-ui';
import { useState } from 'react';

export const AutomationRecordTableStatusInlineCell = ({
  cell,
}: {
  cell: Cell<TAutomationRecordTableColumnDefData, any>;
}) => {
  const [open, setOpen] = useState(false);
  const status =
    cell.getValue() as TAutomationRecordTableColumnDefData['status'];
  const { setActive, loading } = useAutomationStatusToggle(
    cell.row.original._id,
    () => setOpen(false),
  );

  return (
    <PopoverScoped
      scope={AutomationsHotKeyScope.AutomationsTableInlinePopover}
      open={open}
      onOpenChange={setOpen}
    >
      <RecordTableInlineCell.Trigger>
        <div className="w-full flex">
          <AutomationStatusBadge status={status} loading={loading} />
        </div>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="h-cell">
        <AutomationStatusToggle
          status={status}
          loading={loading}
          setActive={setActive}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
