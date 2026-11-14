import { AiAgentRuntimeInfo } from '@/automations/components/aiAgent/AiAgentRuntimeInfo';
import { AiAgentMemoryFields } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentMemoryFields';
import { AiAgentConfigRail } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentConfigRail';
import { AiAgentOutputFields } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentOutputFields';
import { AiAgentSetupFields } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentSetupFields';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { AiAgentActionProvider } from '@/automations/components/builder/nodes/actions/aiAgent/context/AiAgentActionProvider';
import { AiAgentDetailSheetContent } from '@/automations/components/settings/components/agents/components/AiAgentDetailSheetContent';
import { Tabs } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import { TAutomationActionProps } from 'ui-modules';
import { useAiAgentConfigFormView } from '../hooks/useAiAgentConfigFormView';

export const AIAgentConfigForm = ({
  currentAction,
  handleSave,
}: TAutomationActionProps<TAiAgentConfigForm>) => {
  const {
    form,
    selectedAgent,
    config,
    automationsAiAgents,
    sheet,
    openSheet,
    closeSheet,
    handleCreated,
    agentSelectOpen,
    setAgentSelectOpen,
    tab,
    changeTab,
    outputTab,
    setOutputTab,
    outputCount,
    onSave,
  } = useAiAgentConfigFormView({ currentAction, handleSave });

  return (
    <FormProvider {...form}>
      <AiAgentActionProvider actionId={currentAction.id}>
        <AutomationConfigFormWrapper onSave={onSave}>
          {/* Bleeds over the wrapper padding so the rail runs edge to edge */}
          <Tabs
            value={tab}
            onValueChange={changeTab}
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
              outputCount={outputCount}
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
