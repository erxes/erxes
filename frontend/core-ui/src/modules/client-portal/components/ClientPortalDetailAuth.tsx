import {
  CLIENTPORTAL_AUTH_SCHEMA,
  CLIENTPORTAL_OTP_RESEND_SCHEMA,
  CLIENTPORTAL_OTP_SCHEMA,
} from '@/client-portal/constants/clientPortalEditSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  Button,
  Spinner,
  InfoCard,
  ToggleGroup,
  Input,
  Tabs,
  Switch,
  Select,
} from 'erxes-ui';
import { z } from 'zod';
import { useUpdateClientPortal } from '@/client-portal/hooks/useUpdateClientPortal';
import { IClientPortal } from '../types/clientPortal';
import { useState } from 'react';

function stripTypename<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(stripTypename) as T;
  }
  const result = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    if (key === '__typename') continue;
    (result as Record<string, unknown>)[key] = stripTypename(value);
  }
  return result;
}

export const ClientPortalDetailAuth = ({
  clientPortal = {},
}: {
  clientPortal?: IClientPortal;
}) => {
  const [activeTab, setActiveTab] = useState<
    'token' | 'email' | 'phone' | 'resend'
  >('token');

  const otpConfig = clientPortal?.securityAuthConfig?.otpConfig;
  const otpResendConfig = clientPortal?.securityAuthConfig?.otpResendConfig;

  const tokenForm = useForm<z.infer<typeof CLIENTPORTAL_AUTH_SCHEMA>>({
    resolver: zodResolver(CLIENTPORTAL_AUTH_SCHEMA),
    defaultValues: {
      tokenPassMethod:
        clientPortal?.auth?.authConfig?.deliveryMethod ?? 'cookie',
      tokenExpiration:
        clientPortal?.auth?.authConfig?.accessTokenExpirationInDays ?? 1,
      refreshTokenExpiration:
        clientPortal?.auth?.authConfig?.refreshTokenExpirationInDays ?? 1,
    },
  });

  const otpForm = useForm<z.infer<typeof CLIENTPORTAL_OTP_SCHEMA>>({
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

  const otpResendForm = useForm<z.infer<typeof CLIENTPORTAL_OTP_RESEND_SCHEMA>>(
    {
      resolver: zodResolver(CLIENTPORTAL_OTP_RESEND_SCHEMA),
      defaultValues: {
        cooldownPeriodInSeconds: otpResendConfig?.cooldownPeriodInSeconds ?? 60,
        maxAttemptsPerHour: otpResendConfig?.maxAttemptsPerHour ?? 5,
      },
    },
  );

  const { updateClientPortal, loading } = useUpdateClientPortal();

  function handleTokenSubmit(data: z.infer<typeof CLIENTPORTAL_AUTH_SCHEMA>) {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: {
          auth: {
            authConfig: {
              deliveryMethod: data.tokenPassMethod,
              accessTokenExpirationInDays: data.tokenExpiration,
              refreshTokenExpirationInDays: data.refreshTokenExpiration,
            },
          },
        },
      },
    });
  }

  function handleOTPSubmit(data: z.infer<typeof CLIENTPORTAL_OTP_SCHEMA>) {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: {
          securityAuthConfig: stripTypename({
            otpConfig: {
              email: data.email,
              sms: data.sms,
            },
          }),
        },
      },
    });
  }

  function handleOtpResendSubmit(
    data: z.infer<typeof CLIENTPORTAL_OTP_RESEND_SCHEMA>,
  ) {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: {
          securityAuthConfig: stripTypename({
            ...clientPortal?.securityAuthConfig,
            otpResendConfig: {
              cooldownPeriodInSeconds: data.cooldownPeriodInSeconds,
              maxAttemptsPerHour: data.maxAttemptsPerHour,
            },
          }),
        },
      },
    });
  }

  return (
    <InfoCard title="Authentication Token">
      <InfoCard.Content className="gap-4">
        <ToggleGroup
          type="single"
          value={activeTab}
          onValueChange={(val) =>
            setActiveTab(val as 'token' | 'email' | 'phone' | 'resend')
          }
          variant="outline"
        >
          <ToggleGroup.Item value="token" className="flex-auto">
            Token Settings
          </ToggleGroup.Item>
          <ToggleGroup.Item value="email" className="flex-auto">
            Email
          </ToggleGroup.Item>
          <ToggleGroup.Item value="phone" className="flex-auto">
            Phone
          </ToggleGroup.Item>
          <ToggleGroup.Item value="resend" className="flex-auto">
            OTP Resend
          </ToggleGroup.Item>
        </ToggleGroup>

        <Tabs
          value={activeTab}
          onValueChange={(val) =>
            setActiveTab(val as 'token' | 'email' | 'phone' | 'resend')
          }
        >
          <Tabs.Content value="token">
            <Form {...tokenForm}>
              <form
                onSubmit={tokenForm.handleSubmit(handleTokenSubmit)}
                className="flex flex-col gap-6"
              >
                <Form.Field
                  control={tokenForm.control}
                  name="tokenPassMethod"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label className="block">
                        Token Pass Method
                      </Form.Label>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                        value={field.value}
                        onValueChange={(val) => field.onChange(val)}
                        className="inline-flex"
                      >
                        <ToggleGroup.Item value="header" className="flex-auto">
                          Header
                        </ToggleGroup.Item>
                        <ToggleGroup.Item value="cookie" className="flex-auto">
                          Cookie
                        </ToggleGroup.Item>
                      </ToggleGroup>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    control={tokenForm.control}
                    name="tokenExpiration"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          Token expiration duration (days)
                        </Form.Label>
                        <Input
                          type="number"
                          min={1}
                          max={7}
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={tokenForm.control}
                    name="refreshTokenExpiration"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          Refresh Token expiration duration (days)
                        </Form.Label>
                        <Input
                          type="number"
                          min={1}
                          max={7}
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      tokenForm.formState.isSubmitting ||
                      !tokenForm.formState.isDirty
                    }
                  >
                    {loading && <Spinner />}
                    Update
                  </Button>
                </div>
              </form>
            </Form>
          </Tabs.Content>

          <Tabs.Content value="email">
            <Form {...otpForm}>
              <form
                onSubmit={otpForm.handleSubmit(handleOTPSubmit)}
                className="flex flex-col gap-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    control={otpForm.control}
                    name="email.enableEmailVerification"
                    render={({ field }) => (
                      <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
                        <Form.Control>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                        </Form.Control>
                        <Form.Label variant="peer">
                          Enable Email Verification
                        </Form.Label>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={otpForm.control}
                    name="email.enablePasswordlessLogin"
                    render={({ field }) => (
                      <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
                        <Form.Control>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                        </Form.Control>
                        <Form.Label variant="peer">
                          Enable Passwordless Login
                        </Form.Label>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={otpForm.control}
                    name="email.emailSubject"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Email Subject</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                        <Form.Description>OTP email subject</Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={otpForm.control}
                    name="email.codeLength"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Code Length</Form.Label>
                        <Form.Control>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </Form.Control>
                        <Form.Description>
                          OTP code length (4-6 digits)
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={otpForm.control}
                    name="email.messageTemplate"
                    render={({ field }) => (
                      <Form.Item className="col-span-2">
                        <Form.Label>Message Template</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                        <Form.Description>
                          Email message body with {'{{code}}'} placeholder
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={otpForm.control}
                    name="email.duration"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Expiration Duration (minutes)</Form.Label>
                        <Form.Control>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </Form.Control>
                        <Form.Description>
                          OTP expiration duration in minutes
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className="mt-2"
                  disabled={loading}
                  variant="secondary"
                >
                  {loading && (
                    <Spinner containerClassName="w-auto flex-none mr-2" />
                  )}
                  Save
                </Button>
              </form>
            </Form>
          </Tabs.Content>

          <Tabs.Content value="phone">
            <Form {...otpForm}>
              <form
                onSubmit={otpForm.handleSubmit(handleOTPSubmit)}
                className="flex flex-col gap-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    control={otpForm.control}
                    name="sms.enablePhoneVerification"
                    render={({ field }) => (
                      <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
                        <Form.Control>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                        </Form.Control>
                        <Form.Label variant="peer">
                          Enable Phone Verification
                        </Form.Label>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={otpForm.control}
                    name="sms.enablePasswordlessLogin"
                    render={({ field }) => (
                      <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
                        <Form.Control>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                        </Form.Control>
                        <Form.Label variant="peer">
                          Enable Passwordless Login
                        </Form.Label>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={otpForm.control}
                    name="sms.smsProvider"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>SMS Provider</Form.Label>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <Form.Control>
                            <Select.Trigger>
                              <Select.Value placeholder="Select SMS provider" />
                            </Select.Trigger>
                          </Form.Control>
                          <Select.Content>
                            <Select.Item value="callPro">CallPro</Select.Item>
                            <Select.Item value="twilio">Twilio</Select.Item>
                          </Select.Content>
                        </Select>
                        <Form.Description>
                          Select the SMS provider to use for sending OTP codes
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={otpForm.control}
                    name="sms.codeLength"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Code Length</Form.Label>
                        <Form.Control>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </Form.Control>
                        <Form.Description>
                          OTP code length (4-6 digits)
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={otpForm.control}
                    name="sms.messageTemplate"
                    render={({ field }) => (
                      <Form.Item className="col-span-2">
                        <Form.Label>Message Template</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                        <Form.Description>
                          SMS message body with {'{{code}}'} placeholder
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={otpForm.control}
                    name="sms.duration"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Expiration Duration (minutes)</Form.Label>
                        <Form.Control>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </Form.Control>
                        <Form.Description>
                          OTP expiration duration in minutes
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className="mt-2"
                  disabled={loading}
                  variant="secondary"
                >
                  {loading && (
                    <Spinner containerClassName="w-auto flex-none mr-2" />
                  )}
                  Save
                </Button>
              </form>
            </Form>
          </Tabs.Content>

          <Tabs.Content value="resend" className="mt-4">
            <Form {...otpResendForm}>
              <form
                onSubmit={otpResendForm.handleSubmit(handleOtpResendSubmit)}
                className="flex flex-col gap-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    control={otpResendForm.control}
                    name="cooldownPeriodInSeconds"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Cooldown period (seconds)</Form.Label>
                        <Form.Control>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              )
                            }
                          />
                        </Form.Control>
                        <Form.Description>
                          Minimum seconds between OTP resend requests
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={otpResendForm.control}
                    name="maxAttemptsPerHour"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Max attempts per hour</Form.Label>
                        <Form.Control>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              )
                            }
                          />
                        </Form.Control>
                        <Form.Description>
                          Maximum OTP resend requests per hour
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className="mt-2"
                  disabled={loading}
                  variant="secondary"
                >
                  {loading && (
                    <Spinner containerClassName="w-auto flex-none mr-2" />
                  )}
                  Save
                </Button>
              </form>
            </Form>
          </Tabs.Content>
        </Tabs>
      </InfoCard.Content>
    </InfoCard>
  );
};
