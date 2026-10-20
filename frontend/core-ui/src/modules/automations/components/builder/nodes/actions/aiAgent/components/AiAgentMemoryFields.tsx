import { useTranslation } from 'react-i18next';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { Form, Input, Select, Switch } from 'erxes-ui';
import { useFormContext, useWatch } from 'react-hook-form';

export const AiAgentMemoryFields = () => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentConfigForm>();

  const readEnabled = useWatch({
    control,
    name: 'memory.read.enabled',
  });

  const writeEnabled = useWatch({
    control,
    name: 'memory.write.enabled',
  });

  return (
    <div className="grid gap-4 rounded-md border bg-muted/20 p-4">
      <div className="space-y-1">
        <h4 className="text-sm font-medium">{t('memory')}</h4>
        <p className="text-xs text-muted-foreground">
          {t('ai-agent-memory-description')}
        </p>
      </div>

      <Form.Field
        control={control}
        name="memory.read.enabled"
        render={({ field }) => (
          <Form.Item className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
            <div className="space-y-1">
              <Form.Label>{t('ai-agent-memory-read')}</Form.Label>
              <Form.Description>
                {t('ai-agent-memory-read-description')}
              </Form.Description>
            </div>
            <Form.Control>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </Form.Control>
          </Form.Item>
        )}
      />

      {readEnabled && (
        <div className="grid gap-3 rounded-md border bg-background p-3">
          <Form.Field
            control={control}
            name="memory.read.namespace"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('ai-agent-memory-read-namespace')}</Form.Label>
                <Form.Control>
                  <Input placeholder="main" {...field} />
                </Form.Control>
                <Form.Description>
                  {t('ai-agent-memory-namespace-description')}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
      )}

      <Form.Field
        control={control}
        name="memory.write.enabled"
        render={({ field }) => (
          <Form.Item className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
            <div className="space-y-1">
              <Form.Label>{t('ai-agent-memory-save')}</Form.Label>
              <Form.Description>
                {t('ai-agent-memory-save-description')}
              </Form.Description>
            </div>
            <Form.Control>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </Form.Control>
          </Form.Item>
        )}
      />

      {writeEnabled && (
        <div className="grid gap-3 rounded-md border bg-background p-3">
          <Form.Field
            control={control}
            name="memory.write.namespace"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('ai-agent-memory-write-namespace')}</Form.Label>
                <Form.Control>
                  <Input placeholder="main" {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={control}
            name="memory.write.key"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('ai-agent-memory-key')}</Form.Label>
                <Form.Control>
                  <Input placeholder="attributes" {...field} />
                </Form.Control>
                <Form.Description>
                  {t('ai-agent-memory-key-description')}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={control}
            name="memory.write.resultPath"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('ai-agent-memory-result-path')}</Form.Label>
                <Form.Control>
                  <Input placeholder="attributes" {...field} />
                </Form.Control>
                <Form.Description>
                  {t('ai-agent-memory-result-path-description')}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />

          <div className="grid gap-3 lg:grid-cols-2">
            <Form.Field
              control={control}
              name="memory.write.mode"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('ai-agent-memory-write-mode')}</Form.Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value
                        placeholder={t('ai-agent-memory-select-mode')}
                      />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="replace">
                        {t('ai-agent-memory-mode-replace')}
                      </Select.Item>
                      <Select.Item value="merge">
                        {t('ai-agent-memory-mode-merge')}
                      </Select.Item>
                    </Select.Content>
                  </Select>
                  <Form.Description>
                    {t('ai-agent-memory-mode-description')}
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={control}
              name="memory.write.ttlMinutes"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('ai-agent-memory-ttl')}</Form.Label>
                  <Form.Control>
                    <Input
                      type="number"
                      min={5}
                      max={10080}
                      value={field.value ?? 1440}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                    />
                  </Form.Control>
                  <Form.Description>
                    {t('ai-agent-memory-ttl-description')}
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};
