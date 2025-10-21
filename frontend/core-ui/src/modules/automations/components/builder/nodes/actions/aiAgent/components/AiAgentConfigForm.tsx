import { AiAgentObjectBuilder } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentObjectBuilder';
import { AiAgentTopicBuilder } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentTopicBuilder';
import { AI_AGENT_NODE_GOAL_TYPES } from '@/automations/components/builder/nodes/actions/aiAgent/constants/aiAgentConfigForm';
import {
  aiAgentConfigFormSchema,
  TAiAgentConfigForm,
} from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { AutomationCoreConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { useAiAgents } from '@/automations/components/settings/components/agents/hooks/useAiAgents';
import { useFormValidationErrorHandler } from '@/automations/hooks/useFormValidationErrorHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Button, Command, Form, Select, Textarea } from 'erxes-ui';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router';
import { TAutomationActionProps } from 'ui-modules';

export const AIAgentConfigForm = ({
  currentAction,
  handleSave,
}: TAutomationActionProps<TAiAgentConfigForm>) => {
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Ai agent node Configuration',
  });
  const form = useForm<TAiAgentConfigForm>({
    resolver: zodResolver(aiAgentConfigFormSchema),
    defaultValues: { ...(currentAction?.config || {}) },
  });
  const { automationsAiAgents } = useAiAgents();

  const { control, handleSubmit } = form;
  const config = useWatch<TAiAgentConfigForm>({
    control,
  });

  return (
    <FormProvider {...form}>
      <AutomationCoreConfigFormWrapper
        onSave={handleSubmit(handleSave, handleValidationErrors)}
      >
        <Form.Field
          control={control}
          name="aiAgentId"
          render={({ field }) => {
            return (
              <Form.Item>
                <Form.Label>Ai Agent</Form.Label>

                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger className="mt-1">
                    <Select.Value placeholder="Select ai agent" />
                  </Select.Trigger>
                  <Select.Content>
                    {automationsAiAgents.map(({ _id, name }) => (
                      <Select.Item key={_id} value={_id}>
                        {name}
                      </Select.Item>
                    ))}
                    <Link to="/settings/automations/agents">
                      <Button variant="ghost" className="w-full">
                        <IconPlus /> Add new agent
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
                <Form.Label>Goal Type</Form.Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger className="mt-1">
                    <Select.Value placeholder="Select goal type" />
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

        {config?.goalType === 'generateObject' && <AiAgentObjectBuilder />}
        {config?.goalType === 'classifyTopic' && <AiAgentTopicBuilder />}
        {config?.goalType === 'generateText' && (
          <Form.Field
            name="prompt"
            control={control}
            render={({ field }) => (
              <Form.Item>
                <Textarea placeholder="Enter prompt" {...field} />
                <Form.Message />
              </Form.Item>
            )}
          />
        )}
      </AutomationCoreConfigFormWrapper>
    </FormProvider>
  );
};
