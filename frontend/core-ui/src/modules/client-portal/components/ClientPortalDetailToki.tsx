import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Spinner } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { CLIENTPORTAL_TOKI_SCHEMA } from '@/client-portal/constants/clientPortalEditSchema';
import { IClientPortal } from '../types/clientPortal';
import { useUpdateClientPortal } from '../hooks/useUpdateClientPortal';
import { useTranslation } from 'react-i18next';

interface Props {
  clientPortal: IClientPortal;
}

export function ClientPortalDetailToki({ clientPortal }: Props) {
  const { t } = useTranslation('settings', { keyPrefix: 'client-portals' });
  const form = useForm<ReturnType<(typeof CLIENTPORTAL_TOKI_SCHEMA)['parse']>>({
    resolver: zodResolver(CLIENTPORTAL_TOKI_SCHEMA),
    defaultValues: {
      merchantId: clientPortal?.auth?.tokiConfig?.merchantId || '',
      apiKey: clientPortal?.auth?.tokiConfig?.apiKey || '',
      username: clientPortal?.auth?.tokiConfig?.username || '',
      password: clientPortal?.auth?.tokiConfig?.password || '',
    },
  });

  const { updateClientPortal, loading } = useUpdateClientPortal();

  function handleSubmit(
    values: ReturnType<(typeof CLIENTPORTAL_TOKI_SCHEMA)['parse']>,
  ) {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: {
          auth: {
            tokiConfig: {
              merchantId: values.merchantId,
              apiKey: values.apiKey,
              username: values.username,
              password: values.password,
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
          name="merchantId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('toki-merchant-id')}</Form.Label>
              <Input {...field} autoComplete="off" />
              <Form.Description>
                {t('toki-merchant-id-description')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('toki-api-key')}</Form.Label>
              <Input {...field} type="password" autoComplete="off" />
              <Form.Description>
                {t('toki-api-key-description')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="username"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('toki-username')}</Form.Label>
              <Input {...field} autoComplete="off" />
              <Form.Description>
                {t('toki-username-description')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="password"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('toki-password')}</Form.Label>
              <Input {...field} type="password" autoComplete="new-password" />
              <Form.Description>
                {t('toki-password-description')}
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
          {t('save')}
        </Button>
      </form>
    </Form>
  );
}
