import { AiAgentRuntimeInfo } from '@/automations/components/aiAgent/AiAgentRuntimeInfo';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { Button, Collapsible, Form, Input } from 'erxes-ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const RUNTIME_DEFAULTS = {
  temperature: 0.2,
  maxTokens: 2000,
  timeoutMs: 15000,
};

// Matches AI_AGENT_LIMITS on the service; a reasoning model can spend
// thousands of tokens thinking before it writes a word.
const MAX_TOKENS_LIMIT = 32768;

const toNumber = (value: string) => {
  if (value === '') {
    return 0;
  }

  return Number(value);
};

export const AiAgentRuntimeForm = () => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentForm>();
  const values = useWatch({ control });

  const temperature = values?.runtime?.temperature ?? RUNTIME_DEFAULTS.temperature;
  const maxTokens = values?.runtime?.maxTokens ?? RUNTIME_DEFAULTS.maxTokens;
  const timeoutMs = values?.runtime?.timeoutMs ?? RUNTIME_DEFAULTS.timeoutMs;

  return (
    <div className="grid gap-4">
      <AiAgentRuntimeInfo
        agent={{
          connection: values?.connection,
          runtime: values?.runtime,
          context: values?.context,
        }}
        title={t('settings-agent-budget')}
        description={t('settings-agent-budget-description')}
      />

      <Collapsible className="group">
        <Collapsible.Trigger asChild>
          <Button variant="secondary" className="w-full justify-start font-medium">
            <Collapsible.TriggerIcon />
            <span>{t('settings-agent-advanced-limits')}</span>
          </Button>
        </Collapsible.Trigger>

        <p className="px-3 pt-2 text-xs text-muted-foreground">
          {t('settings-agent-defaults-applied', {
            temperature,
            maxTokens: maxTokens.toLocaleString(),
            seconds: Math.round(timeoutMs / 1000),
          })}
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
                    value={field.value ?? RUNTIME_DEFAULTS.temperature}
                    onChange={(event) => field.onChange(toNumber(event.target.value))}
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
                    value={field.value ?? RUNTIME_DEFAULTS.maxTokens}
                    onChange={(event) => field.onChange(toNumber(event.target.value))}
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
                    value={field.value ?? RUNTIME_DEFAULTS.timeoutMs}
                    onChange={(event) => field.onChange(toNumber(event.target.value))}
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
