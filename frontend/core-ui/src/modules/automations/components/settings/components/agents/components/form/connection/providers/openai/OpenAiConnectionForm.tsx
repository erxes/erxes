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
import { useTranslation } from 'react-i18next';

export const OpenAiConnectionForm = ({
  existingApiKeyMask,
}: {
  existingApiKeyMask?: string;
}) => {
  const { t } = useTranslation('automations');
  const { control, watch } = useFormContext<TAiAgentForm>();
  const provider = watch('connection.provider') as TAiAgentProvider;
  const providerLabel =
    AI_AGENT_PROVIDER_LABELS[provider] || 'OpenAI-compatible';
  const defaultBaseUrl = AI_AGENT_PROVIDER_DEFAULT_BASE_URLS[provider] || '';

  return (
    <div className="grid gap-4">
      <AiAgentModelSelect />

      <AiAgentSecretField
        name="connection.config.apiKey"
        label={t('settings-connection-api-key')}
        placeholder={AI_AGENT_PROVIDER_API_KEY_PLACEHOLDERS[provider]}
        existingSecretMask={existingApiKeyMask}
        description={t('settings-connection-api-key-description')}
      />

      <Form.Field
        control={control}
        name="connection.config.baseUrl"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('settings-connection-base-url')}</Form.Label>
            <Form.Control>
              <Input placeholder={defaultBaseUrl} {...field} />
            </Form.Control>
            <Form.Description>
              {t('settings-connection-base-url-description', {
                provider: providerLabel,
              })}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
