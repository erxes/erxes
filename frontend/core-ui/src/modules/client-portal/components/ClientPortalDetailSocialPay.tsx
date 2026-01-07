import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Spinner } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { CLIENTPORTAL_SOCIALPAY_SCHEMA } from '@/client-portal/constants/clientPortalEditSchema';
import { IClientPortal } from '../types/clientPortal';
import { useUpdateClientPortal } from '../hooks/useUpdateClientPortal';

interface Props {
  clientPortal: IClientPortal;
}

export function ClientPortalDetailSocialPay({ clientPortal }: Props) {
  const form = useForm<
    ReturnType<(typeof CLIENTPORTAL_SOCIALPAY_SCHEMA)['parse']>
  >({
    resolver: zodResolver(CLIENTPORTAL_SOCIALPAY_SCHEMA),
    defaultValues: {
      publicKey: clientPortal?.auth?.socialpayConfig?.publicKey || '',
      certId: clientPortal?.auth?.socialpayConfig?.certId || '',
    },
  });

  const { updateClientPortal, loading } = useUpdateClientPortal();

  function handleSubmit(
    values: ReturnType<(typeof CLIENTPORTAL_SOCIALPAY_SCHEMA)['parse']>,
  ) {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: {
          auth: {
            socialpayConfig: {
              publicKey: values.publicKey,
              certId: values.certId,
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
          name="publicKey"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>SocialPay Public Key</Form.Label>
              <Input {...field} autoComplete="off" />
              <Form.Description>
                Your SocialPay public key (provided by SocialPay)
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="certId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>SocialPay Cert ID</Form.Label>
              <Input {...field} autoComplete="off" />
              <Form.Description>
                Your SocialPay CertID (provided by SocialPay)
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Button
          type="submit"
          variant="secondary"
          className="mt-2 col-span-2"
          disabled={loading}
        >
          {loading && <Spinner containerClassName="w-auto flex-none" />}
          Save
        </Button>
      </form>
    </Form>
  );
}
