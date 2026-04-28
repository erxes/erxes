import { AiAgentModelSelect } from '@/automations/components/settings/components/agents/components/form/connection/AiAgentModelSelect';
import { AiAgentSecretField } from '@/automations/components/settings/components/agents/components/form/connection/AiAgentSecretField';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { Form, Input } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';

export const OpenAiConnectionForm = ({
  existingApiKeyMask,
}: {
  existingApiKeyMask?: string;
}) => {
  const { control } = useFormContext<TAiAgentForm>();

  return (
    <div className="grid gap-4">
      <AiAgentModelSelect />

      <AiAgentSecretField
        name="connection.config.apiKey"
        label="API Key"
        placeholder="Enter OpenAI API key"
        existingSecretMask={existingApiKeyMask}
        description="Existing secrets stay masked. Replace the key only when you want to rotate it."
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
              Direct OpenAI-compatible endpoint for this organization-owned
              connection.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};

