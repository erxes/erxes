import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { Form, Input, Select } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';

export const AiAgentConnectionForm = () => {
  const { control } = useFormContext<TAiAgentForm>();

  return (
    <div className="grid gap-4">
      <Form.Field
        control={control}
        name="connection.provider"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Provider</Form.Label>
            <Form.Control>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select provider" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="openai-compatible">
                    OpenAI Compatible
                  </Select.Item>
                </Select.Content>
              </Select>
            </Form.Control>
            <Form.Description>
              Works with OpenAI and compatible gateways that expose the same
              chat completions API shape.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="connection.model"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Model</Form.Label>
            <Form.Control>
              <Input placeholder="gpt-4.1-mini" {...field} />
            </Form.Control>
            <Form.Description>
              Choose the model your provider should use for every automation AI
              action.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="connection.config.apiKey"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>API Key</Form.Label>
            <Form.Control>
              <Input
                type="password"
                autoComplete="off"
                placeholder="Enter provider API key"
                {...field}
              />
            </Form.Control>
            <Form.Description>
              Leave this empty when editing if you want to keep the existing
              secret unchanged.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="connection.config.baseUrl"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Base URL</Form.Label>
            <Form.Control>
              <Input placeholder="https://api.openai.com/v1" {...field} />
            </Form.Control>
            <Form.Description>
              Point this to your OpenAI-compatible endpoint. Keep the versioned
              API prefix in the URL.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
