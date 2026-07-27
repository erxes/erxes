import { AiAgentRuntimeInfo } from '@/automations/components/aiAgent/AiAgentRuntimeInfo';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { Form, Input } from 'erxes-ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const toNumber = (value: string) => {
  if (value === '') {
    return 0;
  }

  return Number(value);
};

export const AiAgentRuntimeForm = () => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentForm>();
  const values = useWatch({
    control,
  });

  return (
    <div className="grid gap-4">
      <Form.Field
        control={control}
        name="runtime.temperature"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('temperature', 'Temperature')}</Form.Label>
            <Form.Control>
              <Input
                type="number"
                step="0.1"
                min={0}
                max={2}
                value={field.value ?? 0.2}
                onChange={(event) =>
                  field.onChange(toNumber(event.target.value))
                }
              />
            </Form.Control>
            <Form.Description>
              {t('temperature-description', 'Lower values keep routing and extraction more deterministic.')}
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
            <Form.Label>{t('max-tokens', 'Max Tokens')}</Form.Label>
            <Form.Control>
              <Input
                type="number"
                min={1}
                max={4000}
                value={field.value ?? 500}
                onChange={(event) =>
                  field.onChange(toNumber(event.target.value))
                }
              />
            </Form.Control>
            <Form.Description>
              {t('max-tokens-description', 'Caps the length of the AI response so automation steps stay fast.')}
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
            <Form.Label>{t('timeout-ms', 'Timeout (ms)')}</Form.Label>
            <Form.Control>
              <Input
                type="number"
                min={1000}
                max={30000}
                value={field.value ?? 15000}
                onChange={(event) =>
                  field.onChange(toNumber(event.target.value))
                }
              />
            </Form.Control>
            <Form.Description>
              {t('timeout-ms-description', 'The automation waits for the provider until this timeout is reached.')}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      <AiAgentRuntimeInfo
        agent={{
          connection: values?.connection,
          runtime: values?.runtime,
          context: values?.context,
        }}
        title="Agent Budget"
        description="These limits apply to every automation action that uses this agent."
      />
    </div>
  );
};
