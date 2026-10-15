import { Button, Form, Spinner, Tabs } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { CLIENTPORTAL_OTP_SCHEMA } from '../constants/clientPortalEditSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IClientPortal } from '../types/clientPortal';
import { useUpdateClientPortal } from '../hooks/useUpdateClientPortal';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientPortalOtpChannelFields } from '@/client-portal/components/ClientPortalSecurityFields';

export const ClientPortalDetailOTP = ({
  clientPortal,
}: {
  clientPortal: IClientPortal;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'client-portals' });
  const otpConfig = clientPortal?.securityAuthConfig?.otpConfig;
  const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');

  const form = useForm<z.infer<typeof CLIENTPORTAL_OTP_SCHEMA>>({
    resolver: zodResolver(CLIENTPORTAL_OTP_SCHEMA),
    defaultValues: {
      email: {
        emailSubject: otpConfig?.email?.emailSubject || '',
        messageTemplate: otpConfig?.email?.messageTemplate || '',
        codeLength: otpConfig?.email?.codeLength,
        duration: otpConfig?.email?.duration,
        enableEmailVerification:
          otpConfig?.email?.enableEmailVerification ?? false,
        enablePasswordlessLogin:
          otpConfig?.email?.enablePasswordlessLogin ?? false,
      },
      sms: {
        smsProvider: otpConfig?.sms?.smsProvider || '',
        messageTemplate: otpConfig?.sms?.messageTemplate || '',
        codeLength: otpConfig?.sms?.codeLength,
        duration: otpConfig?.sms?.duration,
        enablePhoneVerification:
          otpConfig?.sms?.enablePhoneVerification ?? false,
        enablePasswordlessLogin:
          otpConfig?.sms?.enablePasswordlessLogin ?? false,
      },
    },
  });
  const isOpen = true;
  const { updateClientPortal, loading } = useUpdateClientPortal();

  const onSubmit = (data: z.infer<typeof CLIENTPORTAL_OTP_SCHEMA>) => {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: {
          securityAuthConfig: {
            otpConfig: {
              email: data.email,
              sms: data.sms,
            },
          },
        },
      },
    });
  };

  const handleEnableOTP = (value: boolean) => {
    if (value) {
      // When enabling, create a basic OTP config
      updateClientPortal({
        variables: {
          id: clientPortal?._id,
          clientPortal: {
            securityAuthConfig: {
              otpConfig: {
                email: {},
                sms: {},
              },
            },
          },
        },
      });
    } else {
      // When disabling, remove the OTP config
      updateClientPortal({
        variables: {
          id: clientPortal?._id,
          clientPortal: {
            securityAuthConfig: {
              otpConfig: null,
            },
          },
        },
      });
    }
  };

  return (
    <>
      {/* <div className="flex items-center gap-2 mb-4">
        <Switch
          id="enableOTP"
          checked={isOpen}
          onCheckedChange={handleEnableOTP}
          disabled={loading}
        />
        <Label variant="peer" htmlFor="enableOTP">{t('enable-otp')}</Label>
      </div> */}
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

              <Tabs.Content value="email" className="mt-4">
                <ClientPortalOtpChannelFields
                  control={form.control}
                  channel="email"
                />
              </Tabs.Content>

              <Tabs.Content value="sms" className="mt-4">
                <ClientPortalOtpChannelFields
                  control={form.control}
                  channel="sms"
                />
              </Tabs.Content>
            </Tabs>

            <Button
              type="submit"
              className="mt-2"
              disabled={loading}
              variant="secondary"
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
