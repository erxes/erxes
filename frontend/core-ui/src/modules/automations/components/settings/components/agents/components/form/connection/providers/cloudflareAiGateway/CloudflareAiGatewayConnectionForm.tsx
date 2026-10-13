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
            <Form.Label>{t('settings-connection-gateway-mode')}</Form.Label>
            <Form.Control>
              <Select
                onValueChange={field.onChange}
                value={field.value || 'compat'}
              >
                <Select.Trigger>
                  <Select.Value
                    placeholder={t('settings-connection-select-gateway-mode')}
                  />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="compat">Compat</Select.Item>
                  <Select.Item value="openai-provider">
                    OpenAI Provider
                  </Select.Item>
                </Select.Content>
              </Select>
            </Form.Control>
            <Form.Description>
              {t('settings-connection-gateway-mode-description')}
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
              <Form.Label>{t('settings-connection-account-id')}</Form.Label>
              <Form.Control>
                <Input
                  placeholder={t('settings-connection-use-platform-default')}
                  {...field}
                />
              </Form.Control>
              <Form.Description>
                {t('settings-connection-account-id-description')}
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
              <Form.Label>{t('settings-connection-gateway-id')}</Form.Label>
              <Form.Control>
                <Input
                  placeholder={t('settings-connection-use-platform-default')}
                  {...field}
                />
              </Form.Control>
              <Form.Description>
                {t('settings-connection-gateway-id-description')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>

      <AiAgentSecretField
        name="connection.config.gatewayToken"
        label={t('settings-connection-gateway-token')}
        placeholder={t('settings-connection-gateway-token-placeholder')}
        existingSecretMask={existingGatewayTokenMask}
        description={t('settings-connection-gateway-token-description')}
      />

      <AiAgentSecretField
        name="connection.config.apiKey"
        label={t('settings-connection-provider-api-key')}
        placeholder={t('settings-connection-provider-key-placeholder')}
        existingSecretMask={existingApiKeyMask}
        description={t('settings-connection-provider-key-description')}
      />

      <Form.Field
        control={control}
        name="connection.config.baseUrl"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>
              {t('settings-connection-base-url-override')}
            </Form.Label>
            <Form.Control>
              <Input
                placeholder={t('settings-connection-base-url-placeholder')}
                {...field}
              />
            </Form.Control>
            <Form.Description>
              {t('settings-connection-base-url-override-description')}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
