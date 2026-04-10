import { AiAgentRuntimeInfo } from '@/automations/components/aiAgent/AiAgentRuntimeInfo';
import { AiAgentObjectBuilder } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentObjectBuilder';
import { AiAgentInputMappingFields } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentInputMappingFields';
import { AiAgentMemoryFields } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentMemoryFields';
import { AiAgentTopicBuilder } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentTopicBuilder';
import { AI_AGENT_NODE_GOAL_TYPES } from '@/automations/components/builder/nodes/actions/aiAgent/constants/aiAgentConfigForm';
import {
  aiAgentConfigFormSchema,
  getDefaultAiAgentMemoryConfig,
  TAiAgentConfigForm,
} from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { useAiAgents } from '@/automations/components/settings/components/agents/hooks/useAiAgents';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Select, Textarea } from 'erxes-ui';
import { useEffect, useMemo, useRef } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router';
import {
  TAutomationActionProps,
  useFormValidationErrorHandler,
} from 'ui-modules';

export const AIAgentConfigForm = ({
  currentAction,
  handleSave,
}: TAutomationActionProps<TAiAgentConfigForm>) => {
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Ai agent node Configuration',
  });
  const form = useForm<TAiAgentConfigForm>({
    resolver: zodResolver(aiAgentConfigFormSchema),
    defaultValues: {
      inputMapping: {
        source: 'trigger',
        path: '',
        customValue: '',
      },
      memory: getDefaultAiAgentMemoryConfig(currentAction?.config?.goalType),
      ...(currentAction?.config || {}),
    },
  });
  const { automationsAiAgents } = useAiAgents();

  const { control, handleSubmit, setValue } = form;
  const config = useWatch<TAiAgentConfigForm>({
    control,
  });
  const selectedAgent = useMemo(
    () =>
      automationsAiAgents.find(({ _id }) => _id === config?.aiAgentId) || null,
    [automationsAiAgents, config?.aiAgentId],
  );
  const previousGoalTypeRef = useRef(currentAction?.config?.goalType);

  useEffect(() => {
    if (!config?.goalType) {
      previousGoalTypeRef.current = config?.goalType;
      return;
    }

    if (previousGoalTypeRef.current !== config.goalType) {
      setValue('memory', getDefaultAiAgentMemoryConfig(config.goalType), {
        shouldDirty: true,
      });
    }

    previousGoalTypeRef.current = config.goalType;
  }, [config?.goalType, setValue]);

  return (
    <FormProvider {...form}>
      <AutomationConfigFormWrapper
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

        <AiAgentInputMappingFields />

        {config?.goalType === 'classification' && <AiAgentObjectBuilder />}
        {config?.goalType === 'splitTopic' && <AiAgentTopicBuilder />}
        {config?.goalType === 'generateText' && (
          <Form.Field
            name="prompt"
            control={control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Instruction Prompt</Form.Label>
                <Textarea placeholder="Enter prompt" {...field} />
                <Form.Description>
                  Describe the final artifact this action should produce. For
                  email generation, ask for a ready-to-use email body instead of
                  a conversational reply.
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        )}

        <AiAgentRuntimeInfo agent={selectedAgent} actionConfig={config} />

        <AiAgentMemoryFields />
      </AutomationConfigFormWrapper>
    </FormProvider>
  );
};
