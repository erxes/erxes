import {
  IconAlertTriangle,
  IconCheck,
  IconCircleCheck,
  IconCopy,
  IconInfoCircle,
  IconPlus,
} from '@tabler/icons-react';
import { Alert, Button, Form, Input, Sheet, Spinner, toast } from 'erxes-ui';
import { useAtom } from 'jotai';
import { Control, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { mailFormSheetAtom } from '../states/mailStates';
import { useIntegrationAdd } from '@/integrations/hooks/useIntegrationAdd';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { IntegrationType } from '@/types/Integration';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { SelectBrand } from 'ui-modules';
import { IMailSendingValue, MailSendingChoice } from './MailSendingChoice';
import { MailSendingRequired } from './MailSendingRequired';
import { useMailSendingReadiness } from '../hooks/useMailSendingAccounts';

export const mailFormSchema = z.object({
  name: z.string().min(1),
  forwardFrom: z.string().email().optional().or(z.literal('')),
  brandId: z.string().min(1, 'Brand is required'),
});

export type MailFormValues = z.infer<typeof mailFormSchema>;

export type FormFieldConfig = {
  name: keyof MailFormValues;
  label: string;
  placeholder: string;
  required?: boolean;
  description?: string;
};

export const MAIL_FORM_FIELDS: FormFieldConfig[] = [
  {
    name: 'name',
    label: 'name',
    placeholder: 'inbox-name-placeholder',
    required: true,
  },
  {
    name: 'forwardFrom',
    label: 'forwarding-address',
    placeholder: 'forwarding-address-placeholder',
    description: 'forwarding-address-description',
  },
];

export const MailFormField = ({
  name,
  label,
  placeholder,
  required,
  description,
  control,
}: FormFieldConfig & { control: Control<MailFormValues> }) => {
  const { t } = useTranslation('frontline');

  return (
    <Form.Field
      name={name}
      control={control}
      render={({ field }) => (
        <Form.Item className="space-y-1">
          <Form.Label className="text-sm font-normal text-muted-foreground">
            {t(label)}
            {required && <span className="ml-0.5 text-destructive">*</span>}
          </Form.Label>
          <Form.Control>
            <Input
              {...field}
              placeholder={t(placeholder)}
              value={field.value ?? ''}
              className="h-9"
            />
          </Form.Control>
          {description && <Form.Description>{t(description)}</Form.Description>}
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

export const MailAddressCallout = ({ address }: { address: string }) => {
  const { t } = useTranslation('frontline');
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    toast({ title: t('copied') });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Alert>
      <IconInfoCircle className="h-4 w-4" />
      <Alert.Title className="font-medium">
        {t('forward-your-mail-here')}
      </Alert.Title>
      <Alert.Description className="mt-2 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
            {address}
          </code>
          <Button size="icon" variant="ghost" onClick={copy} type="button">
            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
          </Button>
        </div>
        <p className="text-muted-foreground">
          {t('forward-your-mail-here-description')}
        </p>
      </Alert.Description>
    </Alert>
  );
};

const STEP_DETAILS = [
  { title: 'mail-step-basics', description: 'mail-step-basics-description' },
  {
    title: 'mail-step-receiving',
    description: 'mail-step-receiving-description',
  },
  { title: 'mail-step-sending', description: 'mail-step-sending-description' },
  { title: 'mail-step-done', description: 'mail-step-done-description' },
];

const MailIntegrationCreated = ({
  integrationId,
  sending,
}: {
  integrationId: string;
  sending: IMailSendingValue;
}) => {
  const { t } = useTranslation('frontline');
  const { integrationDetail, loading } = useIntegrationDetail({
    integrationId,
  });

  const address = (
    integrationDetail?.details as { data?: { address?: string } } | undefined
  )?.data?.address;

  if (loading && !address) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <IconCircleCheck className="h-4 w-4" />
        <Alert.Title className="font-medium">
          {t('mail-inbox-ready')}
        </Alert.Title>
      </Alert>

      {address ? (
        <MailAddressCallout address={address} />
      ) : (
        <Alert variant="destructive">
          <IconAlertTriangle className="h-4 w-4" />
          <Alert.Title className="font-medium">
            {t('mail-address-unavailable')}
          </Alert.Title>
        </Alert>
      )}

      <div className="space-y-1">
        <p className="text-sm font-medium">{t('mail-sending')}</p>
        <p className="text-sm text-muted-foreground">
          {sending.sendingAddress
            ? t('mail-sending-done-own', { address: sending.sendingAddress })
            : t('mail-sending-done-platform')}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium">{t('what-happens-next')}</p>
        <p className="text-sm text-muted-foreground">
          {t('mail-next-steps-description')}
        </p>
      </div>
    </div>
  );
};

const EMPTY_SENDING: IMailSendingValue = {
  sendingAccountId: '',
  sendingAddress: '',
};

// skipcq: JS-R1005
export const MailIntegrationFormSheet = () => {
  const { t } = useTranslation('frontline');
  const [isOpen, setIsOpen] = useAtom(mailFormSheetAtom);
  const [step, setStep] = useState(1);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [sending, setSending] = useState<IMailSendingValue>(EMPTY_SENDING);
  const { id } = useParams();

  const form = useForm<MailFormValues>({
    resolver: zodResolver(mailFormSchema),
    defaultValues: { name: '', forwardFrom: '', brandId: '' },
  });

  const { addIntegration, loading } = useIntegrationAdd();
  const { readiness, loading: readinessLoading } = useMailSendingReadiness();

  const close = () => {
    setIsOpen(false);
    setStep(1);
    setCreatedId(null);
    setSending(EMPTY_SENDING);
    form.reset();
  };

  const values = form.watch();

  const basicsReady = Boolean(values.name?.trim() && values.brandId);

  const sendingReady = sending.sendingAccountId
    ? Boolean(sending.sendingAddress.split('@')[0])
    : Boolean(readiness?.cloudflare?.ready || readiness?.platform?.ready);

  const onSubmit = (data: MailFormValues) =>
    addIntegration({
      variables: {
        name: data.name,
        kind: IntegrationType.MAIL,
        channelId: id ?? '',
        brandId: data.brandId,
        data: {
          forwardFrom: data.forwardFrom,
          sendingAccountId: sending.sendingAccountId,
          sendingAddress: sending.sendingAddress,
        },
      },
      onCompleted(created) {
        const newId = created?.integrationsCreateExternalIntegration?._id;

        if (newId) {
          setCreatedId(newId);
          setStep(4);
        }
      },
    });

  return (
    <div>
      <Sheet
        open={isOpen}
        onOpenChange={(next) => (next ? setIsOpen(true) : close())}
      >
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus />
            {t('add-email-integration')}
          </Button>
        </Sheet.Trigger>

        <Sheet.View>
          <Form {...form}>
            <form
              className="flex flex-1 flex-col overflow-hidden"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <Sheet.Header>
                <Sheet.Title>{t('add-email-integration')}</Sheet.Title>
                <Sheet.Description>
                  {t('mail-setup-description')}
                </Sheet.Description>
                <Sheet.Close />
              </Sheet.Header>

              <Sheet.Content className="flex flex-col overflow-hidden">
                <IntegrationSteps
                  step={step}
                  title={t(STEP_DETAILS[step - 1].title)}
                  stepsLength={STEP_DETAILS.length}
                  description={t(STEP_DETAILS[step - 1].description)}
                />

                <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 pt-0">
                  {step === 1 && (
                    <>
                      <MailFormField
                        {...MAIL_FORM_FIELDS[0]}
                        control={form.control}
                      />
                      <Form.Field
                        name="brandId"
                        control={form.control}
                        render={({ field }) => (
                          <Form.Item className="space-y-1">
                            <Form.Label className="text-sm font-normal text-muted-foreground">
                              {t('brand')}
                              <span className="ml-0.5 text-destructive">*</span>
                            </Form.Label>
                            <Form.Control>
                              <SelectBrand
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder={t('select-a-brand')}
                                className="h-10 w-full rounded-lg border bg-background"
                              />
                            </Form.Control>
                            <Form.Description>
                              {t('choose-brand-description')}
                            </Form.Description>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />
                    </>
                  )}

                  {step === 2 && (
                    <MailFormField
                      {...MAIL_FORM_FIELDS[1]}
                      control={form.control}
                    />
                  )}

                  {step === 3 &&
                    (readiness && !readiness.ready ? (
                      <MailSendingRequired />
                    ) : (
                      <MailSendingChoice
                        value={sending}
                        onChange={setSending}
                        suggestedLocalPart={
                          values.forwardFrom?.split('@')[0] || undefined
                        }
                      />
                    ))}

                  {step === 4 && createdId && (
                    <MailIntegrationCreated
                      integrationId={createdId}
                      sending={sending}
                    />
                  )}
                </div>
              </Sheet.Content>

              <Sheet.Footer>
                {step === 4 ? (
                  <Button type="button" className="ml-auto" onClick={close}>
                    {t('done')}
                  </Button>
                ) : (
                  <>
                    <Button
                      className="mr-auto text-muted-foreground"
                      variant="ghost"
                      type="button"
                      onClick={close}
                      disabled={loading}
                    >
                      {t('cancel')}
                    </Button>

                    <Button
                      variant="secondary"
                      className="bg-border"
                      type="button"
                      disabled={step === 1 || loading}
                      onClick={() => setStep((current) => current - 1)}
                    >
                      {t('previous-step')}
                    </Button>

                    {step < 3 ? (
                      <Button
                        type="button"
                        disabled={step === 1 && !basicsReady}
                        onClick={() => setStep((current) => current + 1)}
                      >
                        {t('next-step')}
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={
                          loading ||
                          readinessLoading ||
                          !basicsReady ||
                          !sendingReady
                        }
                      >
                        {loading ? t('saving') : t('create')}
                      </Button>
                    )}
                  </>
                )}
              </Sheet.Footer>
            </form>
          </Form>
        </Sheet.View>
      </Sheet>
    </div>
  );
};
