import { useTranslation } from 'react-i18next';
import { OutgoinWebhookLabeledSeparator } from '@/automations/components/builder/nodes/actions/webhooks/components/OutgoinWebhookLabeledSeparator';
import { TOutgoingWebhookForm } from '@/automations/components/builder/nodes/actions/webhooks/states/outgoingWebhookFormSchema';
import { Form, Input, Select, Switch } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';

export const OutgoingWebhookOptions = () => {
  const { control, getValues } = useFormContext<TOutgoingWebhookForm>();
  const { t } = useTranslation('automations');

  return (
    <div className="flex flex-col gap-6">
      <Form.Field
        control={control}
        name="options.ignoreSSL"
        render={({ field }) => (
          <Form.Item className="flex flex-row justify-between">
            <div>
              <Form.Label>{t('webhook-ssl-verification')} </Form.Label>
              <Form.Description>
                {t('webhook-ssl-verification-description')}{' '}
              </Form.Description>
            </div>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="options.continueOnHttpError"
        render={({ field }) => (
          <Form.Item className="flex flex-row justify-between">
            <div>
              <Form.Label>{t('webhook-continue-on-http-error')}</Form.Label>
              <Form.Description>
                {t('webhook-continue-on-http-error-description')}
              </Form.Description>
            </div>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="options.timeout"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('webhook-timeout')}</Form.Label>

            <Input {...field} />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="options.followRedirect"
        render={({ field }) => (
          <Form.Item className="flex flex-row justify-between">
            <div>
              <Form.Label>{t('webhook-follow-redirects')} </Form.Label>
              <Form.Description>
                {t('webhook-follow-redirects-description')}
              </Form.Description>
            </div>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="options.followRedirect"
        render={({ field: { value: isChecked } }) =>
          isChecked ? (
            <Form.Field
              control={control}
              name="options.maxRedirects"
              render={({ field }) => (
                <Form.Item>
                  <div>
                    <Form.Label>{t('webhook-max-redirects')}</Form.Label>
                    <Form.Description>
                      {t('webhook-max-redirects-description')}
                    </Form.Description>
                  </div>
                  <Input {...field} />
                  <Form.Message />
                </Form.Item>
              )}
            />
          ) : (
            <></>
          )
        }
      />

      <OutgoinWebhookLabeledSeparator>
        {t('webhook-retry-configuration')}
      </OutgoinWebhookLabeledSeparator>

      <Form.Field
        control={control}
        name="options.retry.attempts"
        render={({ field }) => (
          <Form.Item className="space-y-2">
            <Form.Label>{t('webhook-retry-attempts')}</Form.Label>
            <Input
              value={field.value}
              onChange={(e) => {
                const value = e.currentTarget.value;
                field.onChange(!value ? undefined : Number(value));
              }}
              type="number"
              min="0"
              max="10"
            />
            <Form.Description>
              {t('webhook-retry-attempts-description')}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="options.retry.delay"
        render={({ field }) => (
          <Form.Item className="space-y-2">
            <Form.Label>{t('webhook-retry-delay')}</Form.Label>
            <Input
              value={field.value}
              onChange={(e) => {
                const value = e.currentTarget.value;
                field.onChange(!value ? undefined : Number(value));
              }}
              type="number"
              min="100"
              max="60000"
            />
            <Form.Description className="text-xs text-gray-500">
              {t('webhook-retry-delay-description')}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="options.retry.backoff"
        render={() => (
          <Form.Item className="space-y-2">
            <Form.Label>{t('webhook-backoff-strategy')}</Form.Label>
            <Select defaultValue="none">
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="none">
                  {t('webhook-backoff-none')}
                </Select.Item>
                <Select.Item value="linear">
                  {t('webhook-backoff-linear')}
                </Select.Item>
                <Select.Item value="exponential">
                  {t('webhook-backoff-exponential')}
                </Select.Item>
              </Select.Content>
            </Select>
            <Form.Message />
          </Form.Item>
        )}
      />
      <OutgoinWebhookLabeledSeparator>
        {t('webhook-proxy-configuration')}
      </OutgoinWebhookLabeledSeparator>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Form.Field
            control={control}
            name="options.proxy.host"
            render={({ field }) => (
              <Form.Item className="space-y-2">
                <Form.Label>{t('webhook-proxy-host')}</Form.Label>
                <Input {...field} placeholder="proxy.example.com" />
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={control}
            name="options.proxy.port"
            render={({ field }) => (
              <Form.Item className="space-y-2">
                <Form.Label>{t('webhook-proxy-port')}</Form.Label>
                <Input
                  value={field.value}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    field.onChange(!value ? undefined : Number(value));
                  }}
                  type="number"
                  placeholder="8080"
                />
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Form.Field
            control={control}
            name="options.proxy.auth.username"
            render={({ field }) => (
              <Form.Item className="space-y-2">
                <Form.Label>{t('webhook-proxy-username')}</Form.Label>
                <Input
                  {...field}
                  placeholder={t('webhook-optional-placeholder')}
                />
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={control}
            name="options.proxy.auth.password"
            render={({ field }) => (
              <Form.Item className="space-y-2">
                <Form.Label>{t('webhook-proxy-password')}</Form.Label>
                <Input
                  {...field}
                  placeholder={t('webhook-optional-placeholder')}
                />
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
      </div>
    </div>
  );
};
