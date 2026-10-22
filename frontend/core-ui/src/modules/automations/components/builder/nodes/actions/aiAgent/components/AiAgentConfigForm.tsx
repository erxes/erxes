import { AiAgentRuntimeInfo } from '@/automations/components/aiAgent/AiAgentRuntimeInfo';
import { AiAgentMemoryFields } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentMemoryFields';
import { AiAgentConfigRail } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentConfigRail';
import { AiAgentOutputFields } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentOutputFields';
import { AiAgentSetupFields } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentSetupFields';
import {
  TAiAgentConfigTab,
  useAiAgentConfigTabs,
} from '@/automations/components/builder/nodes/actions/aiAgent/hooks/useAiAgentConfigTabs';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { AiAgentActionProvider } from '@/automations/components/builder/nodes/actions/aiAgent/context/AiAgentActionProvider';
import { AiAgentDetailSheetContent } from '@/automations/components/settings/components/agents/components/AiAgentDetailSheetContent';
import { Tabs } from 'erxes-ui';
import { DeepPartial, FieldErrors, FormProvider } from 'react-hook-form';
import { TAutomationActionProps } from 'ui-modules';
import { useAiAgentBuilderSheet } from '../hooks/useAiAgentBuilderSheet';
import { useAiAgentConfigForm } from '../hooks/useAiAgentConfigForm';

const getOutputCount = (config?: DeepPartial<TAiAgentConfigForm>) => {
  if (config?.goalType === 'splitTopic') return config.topics?.length || 0;
  if (config?.goalType === 'classification') {
    return config.objectFields?.length || 0;
  }
  if (config?.goalType === 'generateText') {
    return (config.captureFields?.length || 0) + (config.tools?.length || 0);
  }
  return 0;
};

export const AIAgentConfigForm = ({
  currentAction,
  handleSave,
}: TAutomationActionProps<TAiAgentConfigForm>) => {
  const {
    form,
    handleSubmit,
    handleValidationErrors,
    selectedAgent,
    config,
    automationsAiAgents,
  } = useAiAgentConfigForm({ currentAction });
  const {
    sheet,
    openSheet,
    closeSheet,
    handleCreated,
    agentSelectOpen,
    setAgentSelectOpen,
  } = useAiAgentBuilderSheet({
    onCreated: (agentId) =>
      form.setValue('aiAgentId', agentId, { shouldDirty: true }),
  });
  const { tab, setTab, outputTab, setOutputTab, showFirstError } =
    useAiAgentConfigTabs();

  const handleInvalid = (errors: FieldErrors<TAiAgentConfigForm>) => {
    showFirstError(errors);
    handleValidationErrors(errors);
  };

  return (
    <FormProvider {...form}>
      <AiAgentActionProvider actionId={currentAction.id}>
        <AutomationConfigFormWrapper
          onSave={handleSubmit(handleSave, handleInvalid)}
        >
          {/* Bleeds over the wrapper padding so the rail runs edge to edge */}
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as TAiAgentConfigTab)}
            orientation="vertical"
            className="-m-4 flex min-w-72 flex-1"
          >
            <div className="min-w-0 flex-1 p-4">
              <Tabs.Content value="setup">
                <AiAgentSetupFields
                  agents={automationsAiAgents}
                  agentSelectOpen={agentSelectOpen}
                  onAgentSelectOpenChange={setAgentSelectOpen}
                  onOpenAgentSheet={openSheet}
                />
              </Tabs.Content>
              <Tabs.Content value="output">
                <AiAgentOutputFields
                  outputTab={outputTab}
                  onOutputTabChange={setOutputTab}
                />
              </Tabs.Content>
              <Tabs.Content value="memory">
                <AiAgentMemoryFields />
              </Tabs.Content>
            </div>
            <AiAgentConfigRail
              outputCount={getOutputCount(config)}
              snapshot={
                <AiAgentRuntimeInfo
                  agent={selectedAgent}
                  actionConfig={config}
                />
              }
            />
          </Tabs>
        </AutomationConfigFormWrapper>
      </AiAgentActionProvider>
      {sheet && (
        <AiAgentDetailSheetContent
          agentId={sheet.agentId}
          onClose={closeSheet}
          onCreated={handleCreated}
          persistStepInUrl={false}
        />
      )}
    </FormProvider>
  );
};
