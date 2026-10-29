import {
  IntegrationFormItem,
  IntegrationEditButton,
} from '@/integrations/components/IntegrationPanelForm';

import { IIntegration } from '@/integrations/types/Integration';
import {
  Alert,
  Button,
  Form,
  Separator,
  Sheet,
  Spinner,
  toast,
} from 'erxes-ui';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { useForm, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectBrand } from 'ui-modules';
import {
  MAIL_FORM_FIELDS,
  MailAddressCallout,
  MailFormField,
  MailFormValues,
  MailSenderPreview,
  mailFormSchema,
} from './MailIntegrationForm';
import { MailConnectionCheck } from './MailConnectionCheck';
import { MailIntegrationFormLayout } from './MailIntegrationFormLayout';
import { useMailSendingReadiness } from '../hooks/useMailSendingReadiness';
import { isRecord } from '@/shared/utils/isRecord';

const MAIL_HEALTH_UNHEALTHY = 'unHealthy';

const readMailDetails = (details: unknown) => {
  const data = isRecord(details) && isRecord(details.data) ? details.data : {};
  const text = (key: string) => {
    const value = data[key];
    return typeof value === 'string' ? value : undefined;
  };

  return {
    address: text('address'),
    forwardFrom: text('forwardFrom'),
    senderName: text('senderName'),
    healthStatus: text('healthStatus'),
    error: text('error'),
  };
};

const MailIntegrationBrandField = ({
  control,
}: {
  control: Control<MailFormValues>;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  return (
    <Form.Field
      name="brandId"
      control={control}
      render={({ field }) => (
        <IntegrationFormItem label={t('brand')}>
          <Form.Control>
            <SelectBrand
              value={field.value}
              onValueChange={field.onChange}
              placeholder={t('select-a-brand')}
              className="w-full h-10 rounded-lg border bg-background"
            />
          </Form.Control>
          <Form.Message />
        </IntegrationFormItem>
      )}
    />
  );
};

export const MailIntegrationEditForm = ({
  id,
  setOpen,
}: {
  id: string;
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const { loading, integrationDetail } = useIntegrationDetail({
    integrationId: id,
  });
  const { editIntegration, loading: editLoading } = useIntegrationEdit();
  const { readiness } = useMailSendingReadiness();

  const form = useForm<MailFormValues>({
    resolver: zodResolver(mailFormSchema),
  });

  const sendingDomain =
    readiness?.cloudflare?.domain || readiness?.platform?.domain || null;

  const details = readMailDetails(integrationDetail?.details);

  useEffect(() => {
    if (!integrationDetail) {
      return;
    }

    const d = readMailDetails(integrationDetail.details);

    form.reset({
      name: integrationDetail.name ?? '',
      forwardFrom: d.forwardFrom ?? '',
      senderName: d.senderName ?? '',
      brandId: integrationDetail.brandId ?? '',
    });
  }, [integrationDetail, form]);

  const onSubmit = (data: MailFormValues) => {
    editIntegration({
      variables: {
        _id: id,
        name: data.name,
        channelId: integrationDetail?.channelId ?? '',
        brandId: data.brandId,
        details: {
          forwardFrom: data.forwardFrom,
          senderName: data.senderName,
        },
      },
      refetchQueries: [
        'Integrations',
        'IntegrationDetail',
        'ChannelIntegrationsPeek',
      ],
      onCompleted: () => {
        setOpen(false);
        toast({ title: t('mail-integration-updated') });
      },
      onError: (err) => {
        toast({ title: err.message, variant: 'destructive' });
      },
    });
  };

  if (loading) {
    return <Spinner className="p-20" />;
  }

  const content = (
    <Sheet.Content className="min-h-0 space-y-4 overflow-y-auto p-4">
      {details.healthStatus === MAIL_HEALTH_UNHEALTHY && details.error && (
        <Alert variant="destructive" className="mb-4">
          <IconAlertTriangle className="h-4 w-4" />
          <Alert.Title className="font-medium">
            {t('mail-integration-unhealthy')}
          </Alert.Title>
          <Alert.Description className="mt-1 text-sm">
            {details.error}
          </Alert.Description>
        </Alert>
      )}

      {details.address && <MailAddressCallout address={details.address} />}

      <MailConnectionCheck />

      <Separator />

      {MAIL_FORM_FIELDS.map((field) => (
        <MailFormField key={field.name} {...field} control={form.control} />
      ))}

      <Separator />

      <div className="space-y-1">
        <p className="text-sm font-medium">{t('mail-sending')}</p>
        <p className="text-sm text-muted-foreground">
          {sendingDomain
            ? t('mail-sending-sender-default', { domain: sendingDomain })
            : t('mail-sending-sender-default-unavailable')}
        </p>
        {details.address && (
          <MailSenderPreview
            senderName={
              form.watch('senderName')?.trim() ||
              form.watch('name')?.trim() ||
              ''
            }
            address={details.address}
          />
        )}
      </div>

      <Separator />

      <MailIntegrationBrandField control={form.control} />
    </Sheet.Content>
  );

  const footer = (
    <Sheet.Footer className="h-auto min-h-12 shrink-0 border-t px-2 gap-1">
      <Sheet.Close asChild>
        <Button type="button" variant="ghost" disabled={editLoading}>
          {t('close')}
        </Button>
      </Sheet.Close>
      <Button type="submit" disabled={editLoading}>
        {editLoading ? t('saving') : t('save')}
      </Button>
    </Sheet.Footer>
  );

  return (
    <Form {...form}>
      <form
        id="mail-edit-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-full flex-col overflow-hidden"
      >
        {content}

        {footer}
      </form>
    </Form>
  );
};

export const MailIntegrationActions = ({
  integration,
}: {
  integration: IIntegration;
}) => <IntegrationEditButton integration={integration} />;

export const MailIntegrationDetail = () => <MailIntegrationFormLayout />;
