import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Label, Switch } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CLIENTPORTAL_2FA_SCHEMA } from '../constants/clientPortalEditSchema';
import { z } from 'zod';

export const ClientPortalDetail2FA = () => {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof CLIENTPORTAL_2FA_SCHEMA>>({
    resolver: zodResolver(CLIENTPORTAL_2FA_SCHEMA),
    defaultValues: {
      smsConfig: '',
      emailSubject: '',
      content: '',
    },
  });

  const onSubmit = (data: z.infer<typeof CLIENTPORTAL_2FA_SCHEMA>) => {
    console.log(data);
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Switch id="enable2FA" checked={isOpen} onCheckedChange={setIsOpen} />
        <Label variant="peer" htmlFor="enable2FA">
          Enable 2FA
        </Label>
      </div>
      {isOpen && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-x-4 gap-y-2"
          >
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
                  <Form.Description />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="content"
              render={({ field }) => (
                <Form.Item className="col-span-2">
                  <Form.Label>Content</Form.Label>
                  <Input {...field} />
                  <Form.Description>2FA message body</Form.Description>
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
                    2FA code expiration duration (min)
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="enableTwoFactor"
              render={({ field }) => (
                <Form.Item className="mt-2">
                  <Form.Label
                    variant="peer"
                    className="flex items-center gap-2"
                  >
                    <Switch
                      checked={field.value as boolean}
                      onCheckedChange={field.onChange}
                    />
                    Enable Two-Factor Authentication
                  </Form.Label>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Button type="submit" className="mt-2 w-full col-span-2">
              Save
            </Button>
          </form>
        </Form>
      )}
    </>
  );
};
