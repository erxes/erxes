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
  const { t } = useTranslation('client-portal');
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
              <Form.Label>Toki Merchant ID</Form.Label>
              <Input {...field} autoComplete="off" />
              <Form.Description>
                {t('toki-merchant-id-description', 'Your Toki Client ID (provided by Toki)')}
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
              <Form.Label>{t('toki-api-key', 'Toki API Key')}</Form.Label>
              <Input {...field} type="password" autoComplete="off" />
              <Form.Description>
                {t('toki-api-key-description', 'Your Toki API Key (provided by Toki)')}
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
              <Form.Label>{t('toki-username', 'Toki Username')}</Form.Label>
              <Input {...field} autoComplete="off" />
              <Form.Description>
                {t('toki-username-description', 'Your Toki Username (provided by Toki)')}
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
              <Form.Label>{t('toki-password', 'Toki Password')}</Form.Label>
              <Input {...field} type="password" autoComplete="new-password" />
              <Form.Description>
                {t('toki-password-description', 'Your Toki Password (provided by Toki)')}
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
          {t('save', 'Save')}
        </Button>
      </form>
    </Form>
  );
}
