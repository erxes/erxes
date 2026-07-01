import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Spinner, InfoCard, Tabs } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { CLIENTPORTAL_SMS_PROVIDERS_SCHEMA } from '@/client-portal/constants/clientPortalEditSchema';
import { IClientPortal } from '../types/clientPortal';
import { useUpdateClientPortal } from '../hooks/useUpdateClientPortal';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  clientPortal?: IClientPortal | null;
}

export function ClientPortalDetailSMSProviders({ clientPortal }: Props) {
  const { t } = useTranslation('client-portal');
  const [activeTab, setActiveTab] = useState<'callPro' | 'twilio'>('callPro');

  const smsProvidersConfig = clientPortal?.smsProvidersConfig;

  // Parse JSON fields if they're strings, otherwise use as-is
  const parseConfig = (config: any) => {
    if (!config) return {};
    if (typeof config === 'string') {
      try {
        return JSON.parse(config);
      } catch {
        return {};
      }
    }
    return config || {};
  };

  const callProConfig = parseConfig(smsProvidersConfig?.callPro);
  const twilioConfig = parseConfig(smsProvidersConfig?.twilio);

  const form = useForm<
    ReturnType<(typeof CLIENTPORTAL_SMS_PROVIDERS_SCHEMA)['parse']>
  >({
    resolver: zodResolver(CLIENTPORTAL_SMS_PROVIDERS_SCHEMA),
    defaultValues: {
      callPro: {
        phone: callProConfig?.phone || '',
        token: callProConfig?.token || '',
      },
      twilio: {
        apiKey: twilioConfig?.apiKey || '',
        apiSecret: twilioConfig?.apiSecret || '',
        apiUrl: twilioConfig?.apiUrl || '',
      },
    },
  });

  const { updateClientPortal, loading } = useUpdateClientPortal();

  function handleSubmit(
    values: ReturnType<(typeof CLIENTPORTAL_SMS_PROVIDERS_SCHEMA)['parse']>,
  ) {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: {
          smsProvidersConfig: {
            callPro: values.callPro,
            twilio: values.twilio,
          },
        },
      },
    });
  }

  return (
    <InfoCard title="SMS Providers Configuration">
      <InfoCard.Content>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as 'callPro' | 'twilio')}
            >
              <Tabs.List>
                <Tabs.Trigger value="callPro">CallPro</Tabs.Trigger>
                <Tabs.Trigger value="twilio">Twilio</Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="callPro" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    control={form.control}
                    name="callPro.phone"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('phone', 'Phone')}</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                        <Form.Description>
                          {t('callpro-phone-number', 'CallPro phone number')}
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="callPro.token"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('token', 'Token')}</Form.Label>
                        <Form.Control>
                          <Input
                            {...field}
                            type="password"
                            autoComplete="new-password"
                          />
                        </Form.Control>
                        <Form.Description>
                          {t('callpro-authentication-token', 'CallPro authentication token')}
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
              </Tabs.Content>

              <Tabs.Content value="twilio" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    control={form.control}
                    name="twilio.apiKey"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('api-key', 'API Key')}</Form.Label>
                        <Form.Control>
                          <Input
                            {...field}
                            type="password"
                            autoComplete="new-password"
                          />
                        </Form.Control>
                        <Form.Description>{t('twilio-api-key', 'Twilio API Key')}</Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="twilio.apiSecret"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('api-secret', 'API Secret')}</Form.Label>
                        <Form.Control>
                          <Input
                            {...field}
                            type="password"
                            autoComplete="new-password"
                          />
                        </Form.Control>
                        <Form.Description>{t('twilio-api-secret', 'Twilio API Secret')}</Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="twilio.apiUrl"
                    render={({ field }) => (
                      <Form.Item className="col-span-2">
                        <Form.Label>{t('api-url', 'API URL')}</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                        <Form.Description>
                          {t('twilio-api-url-optional', 'Twilio API URL (optional)')}
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
              </Tabs.Content>
            </Tabs>

            <Button
              type="submit"
              variant="secondary"
              className="mt-2"
              disabled={loading}
            >
              {loading && <Spinner containerClassName="w-auto flex-none" />}
              {t('save', 'Save')}
            </Button>
          </form>
        </Form>
      </InfoCard.Content>
    </InfoCard>
  );
}
