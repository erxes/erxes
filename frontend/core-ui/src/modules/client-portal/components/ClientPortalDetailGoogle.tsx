import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Spinner } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { CLIENTPORTAL_GOOGLE_SCHEMA } from '@/client-portal/constants/clientPortalEditSchema';
import { IClientPortal } from '../types/clientPortal';
import { useUpdateClientPortal } from '../hooks/useUpdateClientPortal';
import { useTranslation } from 'react-i18next';

interface Props {
  clientPortal: IClientPortal;
}

export function ClientPortalDetailGoogle({ clientPortal }: Props) {
  const { t } = useTranslation('settings', { keyPrefix: 'client-portals' });
  const form = useForm<
    ReturnType<(typeof CLIENTPORTAL_GOOGLE_SCHEMA)['parse']>
  >({
    resolver: zodResolver(CLIENTPORTAL_GOOGLE_SCHEMA),
    defaultValues: {
      googleClientId: clientPortal?.auth?.googleOAuth?.clientId || '',
      googleClientSecret: clientPortal?.auth?.googleOAuth?.clientSecret || '',
      googleCredentials: clientPortal?.auth?.googleOAuth?.credentials || '',
      googleRedirectUri: clientPortal?.auth?.googleOAuth?.redirectUri || '',
    },
  });

  const { updateClientPortal, loading } = useUpdateClientPortal();

  function handleSubmit(
    values: ReturnType<(typeof CLIENTPORTAL_GOOGLE_SCHEMA)['parse']>,
  ) {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: {
          auth: {
            googleOAuth: {
              clientId: values.googleClientId,
              clientSecret: values.googleClientSecret,
              credentials: values.googleCredentials,
              redirectUri: values.googleRedirectUri,
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
        className="grid gap-4 grid-cols-2"
        autoComplete="off"
      >
        <Form.Field
          control={form.control}
          name="googleClientId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('google-client-id')}</Form.Label>
              <Form.Control>
                <Input
                  {...field}
                  placeholder={t('enter-google-client-id')}
                  disabled={loading}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="googleClientSecret"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('google-client-secret')}</Form.Label>
              <Form.Control>
                <Input
                  {...field}
                  type="password"
                  placeholder={t('enter-google-client-secret')}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="googleCredentials"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('google-credentials')}</Form.Label>
              <Form.Control>
                <Input
                  {...field}
                  placeholder={t('paste-google-credentials')}
                  disabled={loading}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="googleRedirectUri"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('google-redirect-uri')}</Form.Label>
              <Form.Control>
                <Input
                  {...field}
                  placeholder={t('enter-google-redirect-uri')}
                  disabled={loading}
                />
              </Form.Control>
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
          {t('save')}
        </Button>
      </form>
    </Form>
  );
}
