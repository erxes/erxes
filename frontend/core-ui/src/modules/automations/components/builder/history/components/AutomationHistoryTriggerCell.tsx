import { useAutomation } from '@/automations/context/AutomationProvider';
import { CellContext } from '@tanstack/table-core';
import { RecordTableInlineCell } from 'erxes-ui';
import { IAutomationHistory } from 'ui-modules';

export const AutomationHistoryTriggerCell = ({
  cell,
}: CellContext<IAutomationHistory, unknown>) => {
  const triggerType = cell.row?.original?.triggerType;
  const { triggersConst } = useAutomation();

  const triggerLabel = triggersConst.find(
    ({ type }) => type === triggerType,
  )?.label;

  return (
    <RecordTableInlineCell>
      {triggerLabel || triggerType || 'Empty'}
    </RecordTableInlineCell>
  );
};
