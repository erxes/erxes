import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Label, Spinner, Switch, Tabs } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { CLIENTPORTAL_2FA_SCHEMA } from '../constants/clientPortalEditSchema';
import { z } from 'zod';
import { IClientPortal } from '../types/clientPortal';
import { useUpdateClientPortal } from '../hooks/useUpdateClientPortal';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClientPortalNumberField,
  ClientPortalTextField,
} from '@/client-portal/components/ClientPortalSecurityFields';

export const ClientPortalDetail2FA = ({
  clientPortal,
}: {
  clientPortal: IClientPortal;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'client-portals' });
  const multiFactorConfig = clientPortal?.securityAuthConfig?.multiFactorConfig;
  const isOpen = multiFactorConfig?.isEnabled ?? false;
  const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');

  const form = useForm<z.infer<typeof CLIENTPORTAL_2FA_SCHEMA>>({
    resolver: zodResolver(CLIENTPORTAL_2FA_SCHEMA),
    defaultValues: {
      email: {
        emailSubject: multiFactorConfig?.email?.emailSubject || '',
        messageTemplate: multiFactorConfig?.email?.messageTemplate || '',
        codeLength: multiFactorConfig?.email?.codeLength,
        duration: multiFactorConfig?.email?.duration,
      },
      sms: {
        smsProvider: multiFactorConfig?.sms?.smsProvider || '',
        messageTemplate: multiFactorConfig?.sms?.messageTemplate || '',
        codeLength: multiFactorConfig?.sms?.codeLength,
        duration: multiFactorConfig?.sms?.duration,
      },
    },
  });
  const { updateClientPortal, loading } = useUpdateClientPortal();

  const onSubmit = (data: z.infer<typeof CLIENTPORTAL_2FA_SCHEMA>) => {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: {
          securityAuthConfig: {
            multiFactorConfig: {
              isEnabled: true,
              email: data.email,
              sms: data.sms,
            },
          },
        },
      },
    });
  };

  const handleEnable2FA = (value: boolean) => {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: {
          securityAuthConfig: {
            multiFactorConfig: {
              isEnabled: value,
            },
          },
        },
      },
    });
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Switch
          id="enable2FA"
          checked={isOpen}
          onCheckedChange={handleEnable2FA}
          disabled={loading}
        />
        <Label variant="peer" htmlFor="enable2FA">
          {t('enable-2fa')}
        </Label>
      </div>
      {isOpen && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as 'email' | 'sms')}
            >
              <Tabs.List>
                <Tabs.Trigger value="email">{t('email')}</Tabs.Trigger>
                <Tabs.Trigger value="sms">{t('sms-phone')}</Tabs.Trigger>
              </Tabs.List>

              {(['email', 'sms'] as const).map((channel) => (
                <Tabs.Content key={channel} value={channel} className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {channel === 'email' ? (
                      <ClientPortalTextField
                        control={form.control}
                        name="email.emailSubject"
                        label={t('email-subject')}
                        description={t('2fa-email-subject')}
                      />
                    ) : (
                      <ClientPortalTextField
                        control={form.control}
                        name="sms.smsProvider"
                        label={t('sms-provider')}
                        description={t('sms-provider-description')}
                      />
                    )}
                    <ClientPortalNumberField
                      control={form.control}
                      name={`${channel}.codeLength` as const}
                      label={t('code-length')}
                      description={t('2fa-code-length-description')}
                    />
                    <ClientPortalTextField
                      control={form.control}
                      name={`${channel}.messageTemplate` as const}
                      label={t('message-template')}
                      description={t(`${channel}-message-body-description`, {
                        placeholder: '{{code}}',
                      })}
                      fullWidth
                    />
                    <ClientPortalNumberField
                      control={form.control}
                      name={`${channel}.duration` as const}
                      label={t('expiration-duration-minutes')}
                      description={t('2fa-expiration-description')}
                    />
                  </div>
                </Tabs.Content>
              ))}
            </Tabs>

            <Button
              type="submit"
              variant="secondary"
              className="mt-2"
              disabled={loading}
            >
              {loading && (
                <Spinner containerClassName="w-auto flex-none mr-2" />
              )}
              {t('save')}
            </Button>
          </form>
        </Form>
      )}
    </>
  );
};
