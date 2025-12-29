import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Editor, Form, Input, Spinner, ToggleGroup } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CLIENTPORTAL_PASSWORD_VERIFICATION_SCHEMA } from '../constants/clientPortalEditSchema';
import { useUpdateClientPortal } from '../hooks/useUpdateClientPortal';
import { IClientPortal } from '../types/clientPortal';

export const ClientPortalDetailResetPassword = ({
  clientPortal,
}: {
  clientPortal: IClientPortal;
}) => {
  const resetPasswordConfig = clientPortal?.securityAuthConfig?.resetPasswordConfig;
  const form = useForm<
    z.infer<typeof CLIENTPORTAL_PASSWORD_VERIFICATION_SCHEMA>
  >({
    resolver: zodResolver(CLIENTPORTAL_PASSWORD_VERIFICATION_SCHEMA),
    defaultValues: {
      verifyByOTP: resetPasswordConfig?.mode === 'code',
      emailSubject: resetPasswordConfig?.emailSubject,
      emailContent: resetPasswordConfig?.emailContent,
      smsContent: '',
    },
  });
  const { updateClientPortal, loading } = useUpdateClientPortal();

  function handleSubmit(
    data: z.infer<typeof CLIENTPORTAL_PASSWORD_VERIFICATION_SCHEMA>,
  ) {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: {
          securityAuthConfig: {
            resetPasswordConfig: {
              mode: data.verifyByOTP ? 'code' : 'link',
              emailSubject: data.emailSubject || '',
              emailContent: data.emailContent || '',
            },
          },
        },
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="grid grid-cols-2 gap-4"
      >
        <Form.Field
          control={form.control}
          name="verifyByOTP"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Verify by link or code</Form.Label>
              <Form.Control>
                <ToggleGroup
                  type="single"
                  value={field.value ? 'code' : 'link'}
                  onValueChange={(value) => field.onChange(value === 'code')}
                  variant="outline"
                >
                  <ToggleGroup.Item value="link" className="flex-auto">
                    Link
                  </ToggleGroup.Item>
                  <ToggleGroup.Item value="code" className="flex-auto">
                    Code
                  </ToggleGroup.Item>
                </ToggleGroup>
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="emailSubject"
          render={({ field }) => (
            <Form.Item className="col-start-1">
              <Form.Label>Email Subject</Form.Label>
              <Input {...field} />
              <Form.Description>
                The subject for the reset password email (optional)
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="emailContent"
          render={({ field }) => (
            <Form.Item className="col-span-2">
              <Form.Label>Email Content</Form.Label>
              <Editor
                initialContent={field.value}
                onChange={field.onChange}
                isHTML
              />
              <Form.Description>
                Content of the reset password email
              </Form.Description>
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
          {loading && <Spinner containerClassName="w-auto flex-none" />}
          Save
        </Button>
      </form>
    </Form>
  );
};
