import { DecisionTableInputsSection } from '@/automations/components/builder/nodes/actions/decisionTable/components/DecisionTableInputsSection';
import { DecisionTableNoMatchSection } from '@/automations/components/builder/nodes/actions/decisionTable/components/DecisionTableNoMatchSection';
import { DecisionTableOutputsSection } from '@/automations/components/builder/nodes/actions/decisionTable/components/DecisionTableOutputsSection';
import { DecisionTableRowsSection } from '@/automations/components/builder/nodes/actions/decisionTable/components/DecisionTableRowsSection';
import { DecisionTableTestPanel } from '@/automations/components/builder/nodes/actions/decisionTable/components/DecisionTableTestPanel';
import { DecisionTableFormProvider } from '@/automations/components/builder/nodes/actions/decisionTable/context/DecisionTableFormContext';
import { useDecisionTableConfigForm } from '@/automations/components/builder/nodes/actions/decisionTable/hooks/useDecisionTableConfigForm';
import { TDecisionTableConfig } from '@/automations/components/builder/nodes/actions/decisionTable/utils/decisionTableCells';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { FormProvider } from 'react-hook-form';
import { TAutomationActionProps } from 'ui-modules';

export const DecisionTableConfigForm = ({
  currentAction,
  handleSave,
}: TAutomationActionProps<TDecisionTableConfig>) => {
  const api = useDecisionTableConfigForm({ currentAction, handleSave });

  return (
    <FormProvider {...api.form}>
      <DecisionTableFormProvider value={api}>
        <AutomationConfigFormWrapper onSave={api.onSubmit}>
          <div className="flex w-[560px] flex-col gap-6">
            <DecisionTableInputsSection />
            <DecisionTableOutputsSection />
            <DecisionTableRowsSection />
            <DecisionTableNoMatchSection />
            <DecisionTableTestPanel />
          </div>
        </AutomationConfigFormWrapper>
      </DecisionTableFormProvider>
    </FormProvider>
  );
};
