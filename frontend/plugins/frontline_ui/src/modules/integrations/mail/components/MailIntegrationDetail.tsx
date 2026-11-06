import { createIntegrationFormDraft } from '@/integrations/hooks/useIntegrationDraft';
import { PanelFormLayout, PanelFormRow, SelectBrand } from 'ui-modules';

import { IntegrationEditButton } from '@/integrations/components/IntegrationPanelForm';

import { IIntegration } from '@/integrations/types/Integration';
import { Alert, Form, Separator, Spinner, toast } from 'erxes-ui';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { useForm, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

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

/** Extracts mail-specific string fields from the integration details. */
const readMailDetails = (details: unknown) => {
  const data = isRecord(details) && isRecord(details.data) ? details.data : {};
  /** Returns a mail detail value only when it is a string. */
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

/** Connects the mail integration brand picker to form state. */
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
        <Form.Item>
          <PanelFormRow label={t('brand')}>
            <Form.Control>
              <SelectBrand
                value={field.value}
                onValueChange={field.onChange}
                placeholder={t('select-a-brand')}
                className="w-full h-10 rounded-lg border bg-background"
              />
            </Form.Control>
            <Form.Message />
          </PanelFormRow>
        </Form.Item>
      )}
    />
  );
};

const useFormDraft = createIntegrationFormDraft<MailFormValues>();

/** Edits mail integration settings with delivery health and sender details. */
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

  const mailDetails = readMailDetails(integrationDetail?.details);
  const { markSaved, isActive, getSaveValues } = useFormDraft(form, {
    name: integrationDetail?.name ?? '',
    forwardFrom: mailDetails.forwardFrom ?? '',
    senderName: mailDetails.senderName ?? '',
    brandId: integrationDetail?.brandId ?? '',
  });

  /** Saves mail integration fields, refreshes lists, and closes on success. */
  const onSubmit = (data: MailFormValues) => {
    const submittedValues = data;
    const savedValues = getSaveValues(data);
    editIntegration({
      variables: {
        _id: id,
        name: savedValues.name,
        channelId: integrationDetail?.channelId ?? '',
        brandId: savedValues.brandId,
        details: {
          forwardFrom: savedValues.forwardFrom,
          senderName: savedValues.senderName,
        },
      },
      refetchQueries: [
        'Integrations',
        'IntegrationDetail',
        'ChannelIntegrationsPeek',
      ],
      onCompleted: () => {
        if (markSaved(savedValues, submittedValues) && isActive())
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
    <div className="space-y-4">
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
    </div>
  );

  return (
    <Form {...form}>
      <form
        id="mail-edit-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-full flex-col overflow-hidden"
      >
        <PanelFormLayout onCancel={() => setOpen(false)} saving={editLoading}>
          {content}
        </PanelFormLayout>
      </form>
    </Form>
  );
};

/** Opens the selected mail integration in the edit panel. */
export const MailIntegrationActions = ({
  integration,
}: {
  integration: IIntegration;
}) => <IntegrationEditButton integration={integration} />;

/** Renders the entry point for adding a mail integration. */
export const MailIntegrationDetail = () => <MailIntegrationFormLayout />;
