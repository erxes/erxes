import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Label, Spinner, Switch } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { CLIENTPORTAL_2FA_SCHEMA } from '../constants/clientPortalEditSchema';
import { z } from 'zod';
import { IClientPortal } from '../types/clientPortal';
import { useUpdateClientPortal } from '../hooks/useUpdateClientPortal';

export const ClientPortalDetail2FA = ({
  clientPortal,
}: {
  clientPortal: IClientPortal;
}) => {
  const isOpen = clientPortal.enableTwoFactor ?? false;
  const form = useForm<z.infer<typeof CLIENTPORTAL_2FA_SCHEMA>>({
    resolver: zodResolver(CLIENTPORTAL_2FA_SCHEMA),
    defaultValues: clientPortal?.twoFactorConfig,
  });
  const { updateClientPortal, loading } = useUpdateClientPortal();

  const onSubmit = (data: z.infer<typeof CLIENTPORTAL_2FA_SCHEMA>) => {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: { twoFactorConfig: data },
      },
    });
  };

  const handleEnable2FA = (value: boolean) => {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: { enableTwoFactor: value },
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
            className="grid grid-cols-2 gap-x-4 gap-y-2"
          >
            <Form.Field
              control={form.control}
              name="smsTransporterType"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>SMS Config</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </Form.Control>
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
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
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
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
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
                    2FA code expiration duration (min)
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Button
              type="submit"
              variant="secondary"
              className="mt-2 w-full col-span-2"
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
