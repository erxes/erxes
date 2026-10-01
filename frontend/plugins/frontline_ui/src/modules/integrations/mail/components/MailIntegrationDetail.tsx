import { CellContext } from '@tanstack/react-table';
import { IIntegrationDetail } from '@/integrations/types/Integration';
import {
  Alert,
  Button,
  Form,
  Separator,
  Sheet,
  Spinner,
  toast,
} from 'erxes-ui';
import { IconAlertTriangle, IconEdit } from '@tabler/icons-react';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { useForm, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
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

const MAIL_HEALTH_UNHEALTHY = 'unHealthy';

export const MailIntegrationDetail = () => <MailIntegrationFormLayout />;

export const MailIntegrationActions = ({
  cell,
}: {
  cell: CellContext<IIntegrationDetail, unknown>;
}) => <MailIntegrationEditSheet id={cell.row.original._id} />;

const MailIntegrationEditSheet = ({ id }: { id: string }) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <div className="flex items-center gap-2 w-full cursor-pointer">
          <IconEdit size={16} />
          {t('edit')}
        </div>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-xl">
        <MailIntegrationEditForm id={id} setOpen={setOpen} />
      </Sheet.View>
    </Sheet>
  );
};

const MailIntegrationEditForm = ({
  id,
  setOpen,
}: {
  id: string;
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('frontline');
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

  const details = integrationDetail?.details?.data ?? {};

  useEffect(() => {
    if (!integrationDetail) {
      return;
    }

    const d = integrationDetail.details?.data ?? {};

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
      refetchQueries: ['Integrations', 'IntegrationDetail'],
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
    <Sheet.Footer>
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
        <Sheet.Header>
          <Sheet.Title>{integrationDetail?.name || t('edit')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        {content}

        {footer}
      </form>
    </Form>
  );
};

const MailIntegrationBrandField = ({
  control,
}: {
  control: Control<MailFormValues>;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <Form.Field
      name="brandId"
      control={control}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('brand')}</Form.Label>
          <Form.Control>
            <SelectBrand
              value={field.value}
              onValueChange={field.onChange}
              placeholder={t('select-a-brand')}
              className="w-full h-10 rounded-lg border bg-background"
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
