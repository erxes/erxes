import { TDecisionTableConfig } from '@/automations/components/builder/nodes/actions/decisionTable/utils/decisionTableCells';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { AutomationNodeMetaInfoRow } from 'ui-modules';

export const DecisionTableNodeContent = ({
  config,
}: NodeContentComponentProps<TDecisionTableConfig>) => {
  const inputKeys = (config?.inputs || []).map(({ key }) => key).join(', ');
  const outputKeys = (config?.outputs || []).map(({ key }) => key).join(', ');
  const rowCount = config?.rows?.length || 0;

  return (
    <>
      <AutomationNodeMetaInfoRow
        fieldName="Rows"
        content={`${rowCount} · ${inputKeys || 'No inputs'}`}
      />
      <AutomationNodeMetaInfoRow
        fieldName="Outputs"
        content={outputKeys || 'No outputs'}
      />
    </>
  );
};
