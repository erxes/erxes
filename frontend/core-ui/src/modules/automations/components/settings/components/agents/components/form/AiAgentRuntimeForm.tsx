import {
  AI_AGENT_RUNTIME_DEFAULTS,
  useAiAgentRuntimeForm,
} from '@/automations/components/settings/components/agents/hooks/useAiAgentRuntimeForm';
import { Button, Collapsible, Form, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

// Matches AI_AGENT_LIMITS on the service; a reasoning model can spend
// thousands of tokens thinking before it writes a word.
const MAX_TOKENS_LIMIT = 32768;

export const AiAgentRuntimeForm = () => {
  const { t } = useTranslation('automations');
  const { control, appliedValues, asNumber } = useAiAgentRuntimeForm();

  return (
    <div className="grid gap-4">
      <Collapsible className="group">
        <Collapsible.Trigger asChild>
          <Button
            variant="secondary"
            className="w-full justify-start font-medium"
          >
            <Collapsible.TriggerIcon />
            <span>{t('settings-agent-advanced-limits')}</span>
          </Button>
        </Collapsible.Trigger>

        <p className="px-3 pt-2 text-xs text-muted-foreground">
          {t('settings-agent-defaults-applied', appliedValues)}
        </p>

        <Collapsible.Content className="grid gap-4 pt-4">
          <Form.Field
            control={control}
            name="runtime.temperature"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('settings-agent-temperature')}</Form.Label>
                <Form.Control>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    max={2}
                    value={field.value ?? AI_AGENT_RUNTIME_DEFAULTS.temperature}
                    onChange={asNumber(field.onChange)}
                  />
                </Form.Control>
                <Form.Description>
                  {t('settings-agent-temperature-description')}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={control}
            name="runtime.maxTokens"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('settings-agent-max-tokens')}</Form.Label>
                <Form.Control>
                  <Input
                    type="number"
                    min={1}
                    max={MAX_TOKENS_LIMIT}
                    value={field.value ?? AI_AGENT_RUNTIME_DEFAULTS.maxTokens}
                    onChange={asNumber(field.onChange)}
                  />
                </Form.Control>
                <Form.Description>
                  {t('settings-agent-max-tokens-description')}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={control}
            name="runtime.timeoutMs"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('webhook-timeout')}</Form.Label>
                <Form.Control>
                  <Input
                    type="number"
                    min={1000}
                    max={30000}
                    value={field.value ?? AI_AGENT_RUNTIME_DEFAULTS.timeoutMs}
                    onChange={asNumber(field.onChange)}
                  />
                </Form.Control>
                <Form.Description>
                  {t('settings-agent-timeout-description')}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        </Collapsible.Content>
      </Collapsible>
    </div>
  );
};
