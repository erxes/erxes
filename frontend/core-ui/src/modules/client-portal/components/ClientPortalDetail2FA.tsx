import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Label, Spinner, Switch, Tabs } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { CLIENTPORTAL_2FA_SCHEMA } from '../constants/clientPortalEditSchema';
import { z } from 'zod';
import { IClientPortal } from '../types/clientPortal';
import { useUpdateClientPortal } from '../hooks/useUpdateClientPortal';
import { useState } from 'react';

export const ClientPortalDetail2FA = ({
  clientPortal,
}: {
  clientPortal: IClientPortal;
}) => {
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
          Enable 2FA
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
                <Tabs.Trigger value="email">Email</Tabs.Trigger>
                <Tabs.Trigger value="sms">SMS/Phone</Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="email" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    control={form.control}
                    name="email.emailSubject"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Email Subject</Form.Label>
                        <Form.Control>
                          <Input {...field} />
                        </Form.Control>
                        <Form.Description>2FA email subject</Form.Description>
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
                          2FA code length (4-6 digits)
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
                          2FA code expiration duration in minutes
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
                    name="sms.smsProvider"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>SMS Provider</Form.Label>
                        <Form.Control>
                          <Input
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </Form.Control>
                        <Form.Description>
                          SMS provider configuration
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
                          2FA code length (4-6 digits)
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
                          2FA code expiration duration in minutes
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
