import { AiAgentRuntimeInfo } from '@/automations/components/aiAgent/AiAgentRuntimeInfo';
import { AiAgentInputMappingFields } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentInputMappingFields';
import { AiAgentMemoryFields } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentMemoryFields';
import { AiAgentObjectBuilder } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentObjectBuilder';
import { AiAgentTopicBuilder } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentTopicBuilder';
import { AI_AGENT_NODE_GOAL_TYPES } from '@/automations/components/builder/nodes/actions/aiAgent/constants/aiAgentConfigForm';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import {
  IconBrain,
  IconChartPie,
  IconPlus,
  IconSettings,
} from '@tabler/icons-react';
import { Button, Form, Select, Tabs, Textarea } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import { Link } from 'react-router';
import { TAutomationActionProps } from 'ui-modules';
import { useAiAgentConfigForm } from '../hooks/useAiAgentConfigForm';

export const AIAgentConfigForm = ({
  currentAction,
  handleSave,
}: TAutomationActionProps<TAiAgentConfigForm>) => {
  const {
    form,
    control,
    t,
    handleSubmit,
    handleValidationErrors,
    selectedAgent,
    config,
    automationsAiAgents,
  } = useAiAgentConfigForm({ currentAction });

  return (
    <FormProvider {...form}>
      <AutomationConfigFormWrapper
        onSave={handleSubmit(handleSave, handleValidationErrors)}
      >
        <Tabs defaultValue="general" className="min-w-72">
          <Tabs.List className="flex flex-row">
            <Tabs.Trigger value="general" className="flex-1">
              <IconSettings className="size-3.5 mr-2" /> Configuration
            </Tabs.Trigger>
            <Tabs.Trigger value="memory" className="flex-1">
              <IconBrain className="size-3.5 mr-2" /> Memory
            </Tabs.Trigger>
            <Tabs.Trigger value="runtimeSnapshot" className="flex-1">
              <IconChartPie className="size-3.5 mr-2" />
              Runtime Snapshot
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="general" className="flex flex-col gap-2">
            <Form.Field
              control={control}
              name="aiAgentId"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>{t('ai-agent')}</Form.Label>

                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger className="mt-1">
                        <Select.Value placeholder={t('select-ai-agent')} />
                      </Select.Trigger>
                      <Select.Content>
                        {automationsAiAgents.map(({ _id, name }) => (
                          <Select.Item key={_id} value={_id}>
                            {name}
                          </Select.Item>
                        ))}
                        <Link to="/settings/automations/agents">
                          <Button variant="ghost" className="w-full">
                            <IconPlus /> {t('add-new-agent')}
                          </Button>
                        </Link>
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                );
              }}
            />

            <Form.Field
              control={control}
              name="goalType"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>{t('goal-type')}</Form.Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger className="mt-1">
                        <Select.Value placeholder={t('select-goal-type')} />
                      </Select.Trigger>
                      <Select.Content>
                        {AI_AGENT_NODE_GOAL_TYPES.map(({ type, label }) => (
                          <Select.Item key={type} value={type}>
                            {label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                );
              }}
            />

            <AiAgentInputMappingFields />

            {config?.goalType === 'classification' && <AiAgentObjectBuilder />}
            {config?.goalType === 'splitTopic' && <AiAgentTopicBuilder />}
            {config?.goalType === 'generateText' && (
              <Form.Field
                name="prompt"
                control={control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('instruction-prompt')}</Form.Label>
                    <Textarea placeholder={t('enter-prompt')} {...field} />
                    <Form.Description>
                      Describe the final artifact this action should produce.
                      For email generation, ask for a ready-to-use email body
                      instead of a conversational reply.
                    </Form.Description>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            )}
          </Tabs.Content>
          <Tabs.Content value="memory" className="my-2">
            <AiAgentMemoryFields />
          </Tabs.Content>
          <Tabs.Content value="runtimeSnapshot" className="my-2">
            <AiAgentRuntimeInfo agent={selectedAgent} actionConfig={config} />
          </Tabs.Content>
        </Tabs>
      </AutomationConfigFormWrapper>
    </FormProvider>
  );
};
