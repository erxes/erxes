import {
  AI_AGENT_PROVIDER_MODEL_OPTIONS,
  TAiAgentProvider,
} from '@/automations/components/settings/components/agents/constants/providers';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { Form, Select } from 'erxes-ui';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

const formatModelLabel = (model: string) => {
  return model
    .split('/')
    .map((part) => part.toUpperCase())
    .join(' / ');
};

export const AiAgentModelSelect = () => {
  const { control, watch } = useFormContext<TAiAgentForm>();
  const provider = watch('connection.provider') as TAiAgentProvider;
  const currentModel = watch('connection.model');

  const modelOptions = useMemo(() => {
    const options = AI_AGENT_PROVIDER_MODEL_OPTIONS[provider] || [];

    if (currentModel && !options.includes(currentModel)) {
      return [currentModel, ...options];
    }

    return options;
  }, [currentModel, provider]);

  return (
    <Form.Field
      control={control}
      name="connection.model"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Model</Form.Label>
          <Form.Control>
            <Select
              onValueChange={field.onChange}
              value={field.value || undefined}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select model" />
              </Select.Trigger>
              <Select.Content>
                {modelOptions.map((model) => (
                  <Select.Item key={model} value={model}>
                    {formatModelLabel(model)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Form.Control>
          <Form.Description>
            Choose the model this automation agent should use.
          </Form.Description>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

