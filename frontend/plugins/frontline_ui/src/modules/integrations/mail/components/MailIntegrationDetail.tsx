import { CellContext } from '@tanstack/react-table';
import { IIntegrationDetail } from '@/integrations/types/Integration';
import {
  Alert,
  Button,
  Dialog,
  Form,
  Separator,
  Spinner,
  toast,
} from 'erxes-ui';
import { IconAlertTriangle, IconEdit } from '@tabler/icons-react';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectBrand } from 'ui-modules';
import {
  MAIL_FORM_FIELDS,
  MailAddressCallout,
  MailFormField,
  MailFormValues,
  mailFormSchema,
} from './MailIntegrationForm';
import { MailConnectionCheck } from './MailConnectionCheck';
import { IMailSendingValue, MailSendingChoice } from './MailSendingChoice';
import { MailIntegrationFormLayout } from './MailIntegrationFormLayout';

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
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <div className="flex items-center gap-2 w-full cursor-pointer">
          <IconEdit size={16} />
          {t('edit')}
        </div>
      </Dialog.Trigger>
      <Dialog.Content className="p-0 gap-0 border-0 shadow-lg max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        <MailIntegrationEditForm id={id} setOpen={setOpen} />
      </Dialog.Content>
    </Dialog>
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

  const form = useForm<MailFormValues>({
    resolver: zodResolver(mailFormSchema),
  });

  const [sending, setSending] = useState<IMailSendingValue>({
    sendingAccountId: '',
    sendingAddress: '',
  });

  const details = integrationDetail?.details?.data ?? {};

  useEffect(() => {
    if (!integrationDetail) {
      return;
    }

    const d = integrationDetail.details?.data ?? {};

    form.reset({
      name: integrationDetail.name ?? '',
      forwardFrom: d.forwardFrom ?? '',
      brandId: integrationDetail.brandId ?? '',
    });

    setSending({
      sendingAccountId: d.sendingAccountId ?? '',
      sendingAddress: d.sendingAddress ?? '',
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
          sendingAccountId: sending.sendingAccountId,
          sendingAddress: sending.sendingAddress,
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

  return (
    <>
      <Dialog.Header className="flex-row items-center justify-between space-y-0 px-4 py-3 flex-none">
        <Dialog.Title>{integrationDetail?.name}</Dialog.Title>
        <Dialog.Close />
      </Dialog.Header>
      <Separator />

      <Form {...form}>
        <form
          id="mail-edit-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-6 flex-1 overflow-y-auto grid grid-cols-1 gap-3"
        >
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

          <div className="space-y-2">
            <p className="text-sm font-medium">{t('mail-sending')}</p>
            <MailSendingChoice
              value={sending}
              onChange={setSending}
              suggestedLocalPart={
                form.watch('forwardFrom')?.split('@')[0] || undefined
              }
            />
          </div>

          <Separator />

          <Form.Field
            name="brandId"
            control={form.control}
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
        </form>
      </Form>

      <Separator />
      <Dialog.Footer className="flex justify-end gap-2 py-4 px-6 flex-none">
        <Dialog.Close asChild>
          <Button variant="ghost" disabled={editLoading}>
            {t('close')}
          </Button>
        </Dialog.Close>
        <Button type="submit" form="mail-edit-form" disabled={editLoading}>
          {editLoading ? t('saving') : t('save')}
        </Button>
      </Dialog.Footer>
    </>
  );
};
