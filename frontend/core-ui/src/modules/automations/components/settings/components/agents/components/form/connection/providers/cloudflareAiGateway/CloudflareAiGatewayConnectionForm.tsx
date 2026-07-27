import { AiAgentModelSelect } from '@/automations/components/settings/components/agents/components/form/connection/AiAgentModelSelect';
import { AiAgentSecretField } from '@/automations/components/settings/components/agents/components/form/connection/AiAgentSecretField';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { Form, Input, Select } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const CloudflareAiGatewayConnectionForm = ({
  existingApiKeyMask,
  existingGatewayTokenMask,
}: {
  existingApiKeyMask?: string;
  existingGatewayTokenMask?: string;
}) => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentForm>();

  return (
    <div className="grid gap-4">
      <AiAgentModelSelect />

      <Form.Field
        control={control}
        name="connection.config.mode"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('gateway-mode', 'Gateway Mode')}</Form.Label>
            <Form.Control>
              <Select
                onValueChange={field.onChange}
                value={field.value || 'compat'}
              >
                <Select.Trigger>
                  <Select.Value placeholder={t('select-gateway-mode', 'Select gateway mode')} />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="compat">{t('compat', 'Compat')}</Select.Item>
                  <Select.Item value="openai-provider">
                    {t('openai-provider', 'OpenAI Provider')}
                  </Select.Item>
                </Select.Content>
              </Select>
            </Form.Control>
            <Form.Description>
              {t('gateway-mode-description', 'Compat keeps one OpenAI-compatible endpoint while the model name selects the downstream provider.')}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Form.Field
          control={control}
          name="connection.config.accountId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('account-id', 'Account ID')}</Form.Label>
              <Form.Control>
                <Input placeholder={t('use-platform-default', 'Use platform default')} {...field} />
              </Form.Control>
              <Form.Description>
                {t('account-id-description', 'Leave empty to use the platform Cloudflare account.')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={control}
          name="connection.config.gatewayId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('gateway-id', 'Gateway ID')}</Form.Label>
              <Form.Control>
                <Input placeholder={t('use-platform-default', 'Use platform default')} {...field} />
              </Form.Control>
              <Form.Description>
                {t('gateway-id-description', 'Leave empty to use the platform AI Gateway.')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>

      <AiAgentSecretField
        name="connection.config.gatewayToken"
        label="Gateway Token"
        placeholder="Use platform gateway token"
        existingSecretMask={existingGatewayTokenMask}
        description="Optional Cloudflare AI Gateway token. Leave empty to use the platform token."
      />

      <AiAgentSecretField
        name="connection.config.apiKey"
        label="Provider API Key"
        placeholder="Use platform provider key"
        existingSecretMask={existingApiKeyMask}
        description="Optional downstream provider key. Leave empty to use the platform-managed key."
      />

      <Form.Field
        control={control}
        name="connection.config.baseUrl"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('base-url-override', 'Base URL Override')}</Form.Label>
            <Form.Control>
              <Input
                placeholder={t('base-url-override-placeholder', 'Generated from account, gateway, and mode')}
                {...field}
              />
            </Form.Control>
            <Form.Description>
              {t('base-url-override-description', 'Optional. When empty, the backend builds the Cloudflare Gateway URL from the account, gateway, and mode.')}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};

