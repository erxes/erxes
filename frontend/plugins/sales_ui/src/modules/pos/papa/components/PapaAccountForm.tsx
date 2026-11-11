import { useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import { Button, Form, Input, Spinner, toast } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  SALES_PAPA_ADDRESSES,
  SALES_PAPA_CONFIG,
  SALES_PAPA_CONFIG_SAVE,
  SALES_PAPA_REFERENCES,
} from '../graphql/papaDocuments';

const PAPA_DEV_API_URL = 'https://dev-api.papa.mn/api/v4';

const accountSchema = z.object({
  apiUrl: z.string().trim().url().startsWith('https://'),
  clientId: z.string().trim().min(1),
  clientSecret: z.string().trim(),
  // Only used when the Papa account has no staff member yet.
  staffPhone: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || /^\d{8}$/.test(value.replace(/\D/g, '')),
      'Enter an 8-digit phone number',
    ),
  staffEmail: z.union([z.literal(''), z.string().trim().email()]),
  staffFirstName: z.string().trim().max(255),
  staffLastName: z.string().trim().max(255),
});

const EMPTY_STAFF = {
  staffPhone: '',
  staffEmail: '',
  staffFirstName: '',
  staffLastName: '',
};

type TAccountForm = z.infer<typeof accountSchema>;

/**
 * The workspace's Papa Logistic credentials. They are shared by every POS;
 * saving verifies them with Papa and registers the callback URL.
 */
export const PapaAccountForm = () => {
  const { t } = useTranslation('sales');
  const { data, loading } = useQuery(SALES_PAPA_CONFIG);
  const config = data?.salesPapaConfig;
  const [saveConfig, { loading: saving }] = useMutation(
    SALES_PAPA_CONFIG_SAVE,
    {
      refetchQueries: [
        SALES_PAPA_CONFIG,
        SALES_PAPA_ADDRESSES,
        SALES_PAPA_REFERENCES,
      ],
      awaitRefetchQueries: true,
    },
  );

  const form = useForm<TAccountForm>({
    resolver: zodResolver(
      accountSchema.refine(
        (values) => !!config?.hasSecret || values.clientSecret.length > 0,
        {
          path: ['clientSecret'],
          message: t('papa-secret-required', 'Client secret is required'),
        },
      ),
    ),
    defaultValues: {
      apiUrl: PAPA_DEV_API_URL,
      clientId: '',
      clientSecret: '',
      ...EMPTY_STAFF,
    },
  });

  useEffect(() => {
    if (config) {
      form.reset({
        apiUrl: config.apiUrl || PAPA_DEV_API_URL,
        clientId: config.clientId || '',
        clientSecret: '',
        ...EMPTY_STAFF,
      });
    }
  }, [config, form]);

  const onSubmit = async (values: TAccountForm) => {
    try {
      await saveConfig({
        variables: {
          apiUrl: values.apiUrl,
          clientId: values.clientId,
          clientSecret: values.clientSecret || undefined,
          staffPhone: values.staffPhone.replace(/\D/g, '') || undefined,
          staffEmail: values.staffEmail || undefined,
          staffFirstName: values.staffFirstName || undefined,
          staffLastName: values.staffLastName || undefined,
        },
      });
      toast({
        title: t('success'),
        description: t('papa-account-saved', 'Papa account connected'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description:
          error instanceof Error
            ? error.message
            : t('papa-account-save-failed', 'Could not connect to Papa'),
        variant: 'destructive',
      });
    }
  };

  if (loading && !config) {
    return <Spinner />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <p className="text-sm text-muted-foreground">
          {t(
            'papa-account-hint',
            'Credentials from Papa Logistic. They are shared by every POS in this workspace.',
          )}
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <Form.Field
            control={form.control}
            name="apiUrl"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('papa-api-url', 'API URL')}</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('papa-client-id', 'Client ID')}</Form.Label>
                <Form.Control>
                  <Input {...field} autoComplete="off" />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="clientSecret"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  {t('papa-client-secret', 'Client secret')}
                </Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    type="password"
                    autoComplete="new-password"
                    placeholder={
                      config?.hasSecret
                        ? t('papa-secret-saved', 'Saved — leave empty to keep')
                        : ''
                    }
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
        {!config?.staffId && (
          <div className="space-y-2 rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">
              {t(
                'papa-staff-hint',
                'Only needed if this Papa account has no staff member yet: erxes creates one as admin, and orders are placed in its name.',
              )}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {(
                [
                  ['staffPhone', 'papa-staff-phone', 'Staff phone', 'tel'],
                  ['staffEmail', 'papa-staff-email', 'Staff email', 'email'],
                  [
                    'staffFirstName',
                    'papa-staff-first-name',
                    'First name',
                    'text',
                  ],
                  [
                    'staffLastName',
                    'papa-staff-last-name',
                    'Last name',
                    'text',
                  ],
                ] as const
              ).map(([name, labelKey, label, inputMode]) => (
                <Form.Field
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t(labelKey, label)}</Form.Label>
                      <Form.Control>
                        <Input {...field} inputMode={inputMode} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {config?.callbackRegisteredAt ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <IconCircleCheck className="size-4 text-primary" />
              {t(
                'papa-connected',
                'Connected; Papa sends status updates to',
              )}{' '}
              <span className="break-all font-mono">{config.callbackUrl}</span>
            </span>
          ) : config?.staffId ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <IconAlertTriangle className="size-4 text-amber-500" />
              {t(
                'papa-connected-no-callback',
                'Connected without live updates: Papa needs an https gateway domain. Use Refresh on the order to update a delivery.',
              )}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {t('papa-not-connected', 'Not connected yet')}
            </span>
          )}
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? t('saving') : t('papa-connect', 'Save and connect')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
