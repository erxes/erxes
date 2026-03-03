import {
  Button,
  Form,
  Input,
  Label,
  Spinner,
  Switch,
  Tabs,
  Select,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { CLIENTPORTAL_OTP_SCHEMA } from '../constants/clientPortalEditSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IClientPortal } from '../types/clientPortal';
import { useUpdateClientPortal } from '../hooks/useUpdateClientPortal';
import { useState } from 'react';

export const ClientPortalDetailOTP = ({
  clientPortal,
}: {
  clientPortal: IClientPortal;
}) => {
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
        <Label variant="peer" htmlFor="enableOTP">
          Enable OTP
        </Label>
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
                <Tabs.Trigger value="email">Email</Tabs.Trigger>
                <Tabs.Trigger value="sms">SMS/Phone</Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="email" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
              </Tabs.Content>

              <Tabs.Content value="sms" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
              Save
            </Button>
          </form>
        </Form>
      )}
    </>
  );
};
