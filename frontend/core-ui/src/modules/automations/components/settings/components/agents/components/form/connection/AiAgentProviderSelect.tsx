import {
  AI_AGENT_PROVIDER_DESCRIPTIONS,
  AI_AGENT_PROVIDER_LABELS,
  AI_AGENT_PROVIDER_TYPES,
  TAiAgentProvider,
} from '@/automations/components/settings/components/agents/constants/providers';
import { buildDefaultAiAgentConnection } from '@/automations/components/settings/components/agents/states/AiAgentConnectionSchema';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { Form, Select } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';

export const AiAgentProviderSelect = () => {
  const { control, setValue, watch } = useFormContext<TAiAgentForm>();
  const provider = watch('connection.provider');

  return (
    <Form.Field
      control={control}
      name="connection.provider"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Provider</Form.Label>
          <Form.Control>
            <Select
              value={field.value}
              defaultValue={field.value}
              onValueChange={(value) => {
                const nextProvider = value as TAiAgentProvider;

                field.onChange(nextProvider);
                setValue('connection', buildDefaultAiAgentConnection(nextProvider), {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select provider" />
              </Select.Trigger>
              <Select.Content>
                {AI_AGENT_PROVIDER_TYPES.map((type) => (
                  <Select.Item key={type} value={type}>
                    {AI_AGENT_PROVIDER_LABELS[type]}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Form.Control>
          <Form.Description>
            {AI_AGENT_PROVIDER_DESCRIPTIONS[provider]}
          </Form.Description>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

