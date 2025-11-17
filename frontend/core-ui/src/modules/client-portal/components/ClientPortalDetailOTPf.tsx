import { Button, Form, Input, Label, Spinner, Switch } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { CLIENTPORTAL_OTP_SCHEMA } from '../constants/clientPortalEditSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IClientPortal } from '../types/clientPortal';
import { useUpdateClientPortal } from '../hooks/useUpdateClientPortal';

export const ClientPortalDetailOTP = ({
  clientPortal,
}: {
  clientPortal: IClientPortal;
}) => {
  const form = useForm<z.infer<typeof CLIENTPORTAL_OTP_SCHEMA>>({
    resolver: zodResolver(CLIENTPORTAL_OTP_SCHEMA),
    defaultValues: clientPortal?.otpConfig,
  });
  const isOpen = clientPortal.enableOTP ?? false;
  const { updateClientPortal, loading } = useUpdateClientPortal();

  const onSubmit = (data: z.infer<typeof CLIENTPORTAL_OTP_SCHEMA>) => {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: {
          otpConfig: data,
        },
      },
    });
  };

  const handleEnableOTP = (value: boolean) => {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: { enableOTP: value },
      },
    });
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Switch
          id="enableOTP"
          checked={isOpen}
          onCheckedChange={handleEnableOTP}
          disabled={loading}
        />
        <Label variant="peer" htmlFor="enableOTP">
          Enable OTP
        </Label>
      </div>
      {isOpen && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <Form.Field
              control={form.control}
              name="smsTransporterType"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>SMS Config</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
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
              name="content"
              render={({ field }) => (
                <Form.Item className="col-span-2">
                  <Form.Label>Content</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
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
                  <Form.Control>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </Form.Control>
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
                  <Form.Control>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </Form.Control>
                  <Form.Description>
                    OTP expiration duration (min)
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="loginWithOTP"
              render={({ field }) => (
                <Form.Item className="mt-2 col-start-1 flex items-center gap-2 space-y-0">
                  <Form.Control>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </Form.Control>
                  <Form.Label variant="peer">Login with OTP</Form.Label>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Button
              type="submit"
              className="mt-2 col-span-2"
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
