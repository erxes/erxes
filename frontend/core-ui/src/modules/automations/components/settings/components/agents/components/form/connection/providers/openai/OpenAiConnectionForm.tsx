import { AiAgentModelSelect } from '@/automations/components/settings/components/agents/components/form/connection/AiAgentModelSelect';
import { AiAgentSecretField } from '@/automations/components/settings/components/agents/components/form/connection/AiAgentSecretField';
import {
  AI_AGENT_PROVIDER_API_KEY_PLACEHOLDERS,
  AI_AGENT_PROVIDER_DEFAULT_BASE_URLS,
  AI_AGENT_PROVIDER_LABELS,
  TAiAgentProvider,
} from '@/automations/components/settings/components/agents/constants/providers';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { Form, Input } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';

export const OpenAiConnectionForm = ({
  existingApiKeyMask,
}: {
  existingApiKeyMask?: string;
}) => {
  const { control, watch } = useFormContext<TAiAgentForm>();
  const provider = watch('connection.provider') as TAiAgentProvider;
  const providerLabel = AI_AGENT_PROVIDER_LABELS[provider] || 'OpenAI-compatible';
  const defaultBaseUrl = AI_AGENT_PROVIDER_DEFAULT_BASE_URLS[provider] || '';

  return (
    <div className="grid gap-4">
      <AiAgentModelSelect />

      <AiAgentSecretField
        name="connection.config.apiKey"
        label="API Key"
        placeholder={AI_AGENT_PROVIDER_API_KEY_PLACEHOLDERS[provider]}
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
              <Input placeholder={defaultBaseUrl} {...field} />
            </Form.Control>
            <Form.Description>
              Direct OpenAI-compatible endpoint for this {providerLabel}
              connection.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
