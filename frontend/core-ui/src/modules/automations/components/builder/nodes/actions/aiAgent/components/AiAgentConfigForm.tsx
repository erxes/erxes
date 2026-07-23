import { AiAgentRuntimeInfo } from '@/automations/components/aiAgent/AiAgentRuntimeInfo';
import { AiAgentInputFields } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentInputFields';
import { AiAgentMemoryFields } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentMemoryFields';
import { AiAgentObjectBuilder } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentObjectBuilder';
import { AiAgentToolBuilder } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentToolBuilder';
import { AiAgentTopicBuilder } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentTopicBuilder';
import { AI_AGENT_NODE_GOAL_TYPES } from '@/automations/components/builder/nodes/actions/aiAgent/constants/aiAgentConfigForm';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import {
  IconBrain,
  IconChartPie,
  IconListDetails,
  IconPlus,
  IconSettings,
  IconTool,
} from '@tabler/icons-react';
import { Button, Form, Select, Tabs, Textarea } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import { Link, useLocation } from 'react-router';
import { TAutomationActionProps } from 'ui-modules';
import { useAiAgentConfigForm } from '../hooks/useAiAgentConfigForm';
import { setAutomationSettingsReturnPath } from '@/automations/utils/settingsReturn';
import { AutomationSettingsPath } from '@/types/paths/AutomationPath';

const AI_AGENT_CONFIG_FORM_TABS = [
  {
    value: 'general',
    label: 'configuration',
    icon: IconSettings,
  },
  {
    value: 'memory',
    label: 'memory',
    icon: IconBrain,
  },
  {
    value: 'runtimeSnapshot',
    label: 'runtime-snapshot',
    icon: IconChartPie,
  },
  {
    value: 'fields',
    label: 'output-fields',
    icon: IconListDetails,
  },
  {
    value: 'tools',
    label: 'tools',
    icon: IconTool,
  },
];

export const AIAgentConfigForm = ({
  currentAction,
  handleSave,
}: TAutomationActionProps<TAiAgentConfigForm>) => {
  const { pathname } = useLocation();
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
          <Tabs.List className="flex w-full flex-row justify-start overflow-x-auto">
            {AI_AGENT_CONFIG_FORM_TABS.map(({ value, label, icon: Icon }) => (
              <Tabs.Trigger key={value} value={value} className="shrink-0">
                <Icon className="size-3.5 mr-2" /> {t(label)}
              </Tabs.Trigger>
            ))}
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
                        <Link
                          to={AutomationSettingsPath.Agents}
                          onClick={() =>
                            setAutomationSettingsReturnPath(pathname)
                          }
                        >
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

            <AiAgentInputFields />

            {config?.goalType === 'classification' && <AiAgentObjectBuilder />}
            {config?.goalType === 'splitTopic' && <AiAgentTopicBuilder />}
            {config?.goalType === 'generateText' && (
              <>
                <Form.Field
                  name="prompt"
                  control={control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('instruction-prompt')}</Form.Label>
                      <Textarea placeholder={t('enter-prompt')} {...field} />
                      <Form.Description>
                        {t('instruction-prompt-description')}
                      </Form.Description>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="fallbackText"
                  control={control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('fallback-text')}</Form.Label>
                      <Textarea
                        placeholder={t('fallback-text-placeholder')}
                        {...field}
                      />
                      <Form.Description>
                        {t('fallback-text-description')}
                      </Form.Description>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </>
            )}
          </Tabs.Content>
          <Tabs.Content value="memory" className="my-2">
            <AiAgentMemoryFields />
          </Tabs.Content>
          <Tabs.Content value="runtimeSnapshot" className="my-2">
            <AiAgentRuntimeInfo agent={selectedAgent} actionConfig={config} />
          </Tabs.Content>
          <Tabs.Content value="fields" className="my-2">
            <Form.Item>
              <Form.Label>{t('capture-fields')}</Form.Label>
              <Form.Description>
                {t('capture-fields-description')}
              </Form.Description>
              <AiAgentObjectBuilder
                name="captureFields"
                addLabel={t('add-capture-field')}
              />
            </Form.Item>
          </Tabs.Content>
          <Tabs.Content value="tools" className="my-2">
            {config?.goalType === 'generateText' ? (
              <AiAgentToolBuilder />
            ) : (
              <p className="p-2 text-sm text-muted-foreground">
                Tools are available for the generate text goal type.
              </p>
            )}
          </Tabs.Content>
        </Tabs>
      </AutomationConfigFormWrapper>
    </FormProvider>
  );
};
