import { useAutomation } from '@/automations/context/AutomationProvider';
import { useSelectExecutionCellProps } from '@/automations/components/builder/history/hooks/useAutomationHistoryView';
import { CellContext } from '@tanstack/table-core';
import { RecordTableInlineCell } from 'erxes-ui';
import { IAutomationHistory } from 'ui-modules';

export const AutomationHistoryTriggerCell = ({
  cell,
}: CellContext<IAutomationHistory, unknown>) => {
  const triggerType = cell.row?.original?.triggerType;
  const { triggersConst } = useAutomation();
  const selectProps = useSelectExecutionCellProps(cell.row.original._id);

  const triggerLabel = triggersConst.find(
    ({ type }) => type === triggerType,
  )?.label;

  return (
    <RecordTableInlineCell {...selectProps}>
      {triggerLabel || triggerType || 'Empty'}
    </RecordTableInlineCell>
  );
};
