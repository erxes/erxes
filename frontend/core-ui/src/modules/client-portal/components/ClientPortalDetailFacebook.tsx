import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Spinner } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { CLIENTPORTAL_FACEBOOK_SCHEMA } from '@/client-portal/constants/clientPortalEditSchema';
import { IClientPortal } from '../types/clientPortal';
import { useUpdateClientPortal } from '../hooks/useUpdateClientPortal';

interface Props {
  clientPortal: IClientPortal;
}

export function ClientPortalDetailFacebook({ clientPortal }: Props) {
  const form = useForm<
    ReturnType<(typeof CLIENTPORTAL_FACEBOOK_SCHEMA)['parse']>
  >({
    resolver: zodResolver(CLIENTPORTAL_FACEBOOK_SCHEMA),
    defaultValues: {
      facebookAppId: clientPortal?.auth?.facebookOAuth?.appId || '',
    },
  });

  const { updateClientPortal, loading } = useUpdateClientPortal();

  function handleSubmit(
    values: ReturnType<(typeof CLIENTPORTAL_FACEBOOK_SCHEMA)['parse']>,
  ) {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: {
          auth: {
            facebookOAuth: {
              appId: values.facebookAppId,
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
          name="facebookAppId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Facebook App ID</Form.Label>
              <Input {...field} autoComplete="off" />
              <Form.Description>
                Your Facebook App ID. Get it from
                https://developers.facebook.com/
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
