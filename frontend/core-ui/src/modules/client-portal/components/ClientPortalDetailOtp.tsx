import { Button, Form, InfoCard, Input, Label, Switch } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { CLIENTPORTAL_OTP_SCHEMA } from '../constants/clientPortalEditSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

export const ClientPortalDetailOtp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof CLIENTPORTAL_OTP_SCHEMA>>({
    resolver: zodResolver(CLIENTPORTAL_OTP_SCHEMA),
    defaultValues: {
      smsConfig: '',
      emailSubject: '',
      content: '',
    },
  });

  const onSubmit = (data: z.infer<typeof CLIENTPORTAL_OTP_SCHEMA>) => {
    console.log(data);
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Switch checked={isOpen} onCheckedChange={setIsOpen} />
        <Label variant="peer">Enable OTP</Label>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Form.Field
            control={form.control}
            name="smsConfig"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>SMS Config</Form.Label>
                <Input {...field} />
                <Form.Description />
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="emailSubject"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Email Subject</Form.Label>
                <Input {...field} />
                <Form.Description>2FA email subject</Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="content"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Content</Form.Label>
                <Input {...field} />
                <Form.Description>2FA body</Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="codeLength"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Code Length</Form.Label>
                <Input type="number" {...field} />
                <Form.Description />
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="expireAfter"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Expire After</Form.Label>
                <Input type="number" {...field} />
                <Form.Description>
                  OTP expiration duration (min)
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="twoFactorEnabled"
            render={({ field }) => (
              <Form.Item>
                <Form.Label variant="peer" className="flex items-center gap-2">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  2FA enable
                </Form.Label>

                <Form.Message />
              </Form.Item>
            )}
          />
          <Button type="submit">Save</Button>
        </form>
      </Form>
    </>
  );
};
