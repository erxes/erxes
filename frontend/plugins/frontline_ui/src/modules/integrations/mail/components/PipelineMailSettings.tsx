import { zodResolver } from '@hookform/resolvers/zod';
import { IconAlertTriangle, IconMail, IconTrash } from '@tabler/icons-react';
import { Alert, Button, Form, InfoCard, Spinner, useConfirm } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  MAIL_SENDER_NAME_MAX_LENGTH,
  MailAddressCallout,
  MailFormField,
  MailSenderPreview,
} from './MailIntegrationForm';
import { MailSendingRequired } from './MailSendingRequired';
import {
  IMailPipelineIntegration,
  useMailPipelineConnect,
  useMailPipelineDisconnect,
  useMailPipelineIntegration,
  useMailPipelineUpdate,
} from '../hooks/useMailPipelineIntegration';
import { useMailSendingReadiness } from '../hooks/useMailSendingReadiness';

const MAIL_HEALTH_UNHEALTHY = 'unHealthy';

const pipelineMailSchema = z.object({
  senderName: z.string().trim().max(MAIL_SENDER_NAME_MAX_LENGTH).optional(),
});

type PipelineMailValues = z.infer<typeof pipelineMailSchema>;

const PIPELINE_MAIL_FIELDS = [
  {
    name: 'senderName' as const,
    label: 'sender-name',
    placeholder: 'sender-name-placeholder',
    description: 'sender-name-description',
  },
];

const usePipelineMailForm = (integration: IMailPipelineIntegration | null) => {
  const form = useForm<PipelineMailValues>({
    resolver: zodResolver(pipelineMailSchema),
    defaultValues: { senderName: '' },
  });

  useEffect(() => {
    form.reset({ senderName: integration?.senderName ?? '' });
  }, [form, integration]);

  return form;
};

const PipelineMailFields = ({
  form,
}: {
  form: ReturnType<typeof usePipelineMailForm>;
}) => (
  <>
    {PIPELINE_MAIL_FIELDS.map((field) => (
      <MailFormField key={field.name} {...field} control={form.control} />
    ))}
  </>
);

const PipelineMailConnect = ({ pipelineId }: { pipelineId: string }) => {
  const { t } = useTranslation('frontline');
  const form = usePipelineMailForm(null);
  const { connectPipelineMail, loading } = useMailPipelineConnect();

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit((values) =>
          connectPipelineMail(pipelineId, values),
        )}
      >
        <InfoCard
          title={t('pipeline-mail', 'Mail settings')}
          description={t(
            'pipeline-mail-description',
            'Give this pipeline its own address. Mail sent there opens a ticket here, and replies go back from the same address. It stays out of the inbox and out of the channel.',
          )}
        >
          <InfoCard.Content className="grid grid-cols-1 gap-3">
            <PipelineMailFields form={form} />
          </InfoCard.Content>
        </InfoCard>
        <div className="flex justify-end border-t pt-5">
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner /> : <IconMail />}
            {t('pipeline-mail-connect', 'Create mail address')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const PipelineMailConnected = ({
  pipelineId,
  pipelineName,
  integration,
}: {
  pipelineId: string;
  pipelineName: string;
  integration: IMailPipelineIntegration;
}) => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const form = usePipelineMailForm(integration);
  const { updatePipelineMail, loading: updating } = useMailPipelineUpdate();
  const { disconnectPipelineMail, loading: disconnecting } =
    useMailPipelineDisconnect();

  const senderName =
    form.watch('senderName')?.trim() || integration.name || pipelineName;

  const onDisconnect = () =>
    confirm({
      message: t(
        'pipeline-mail-disconnect-confirm',
        'Mail sent to this address will stop opening tickets and the address is released. Mail already on tickets stays.',
      ),
    }).then(() => disconnectPipelineMail(pipelineId));

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit((values) =>
          updatePipelineMail(pipelineId, values),
        )}
      >
        <InfoCard
          title={t('pipeline-mail', 'Mail settings')}
          description={t(
            'pipeline-mail-connected-description',
            'Mail sent to this address opens a ticket in this pipeline. It never reaches the inbox.',
          )}
        >
          <InfoCard.Content className="grid grid-cols-1 gap-3">
            {integration.healthStatus === MAIL_HEALTH_UNHEALTHY &&
              integration.error && (
                <Alert variant="destructive">
                  <IconAlertTriangle className="h-4 w-4" />
                  <Alert.Title className="font-medium">
                    {t('mail-integration-unhealthy')}
                  </Alert.Title>
                  <Alert.Description className="mt-1 text-sm">
                    {integration.error}
                  </Alert.Description>
                </Alert>
              )}

            <MailAddressCallout address={integration.address} />

            <PipelineMailFields form={form} />

            <MailSenderPreview
              senderName={senderName}
              address={integration.address}
            />
          </InfoCard.Content>
        </InfoCard>

        <div className="flex justify-between border-t pt-5">
          <Button
            type="button"
            variant="destructive"
            disabled={disconnecting}
            onClick={onDisconnect}
          >
            {disconnecting ? <Spinner /> : <IconTrash />}
            {t('pipeline-mail-disconnect', 'Remove mail address')}
          </Button>
          <Button type="submit" disabled={updating}>
            {updating ? <Spinner /> : null}
            {t('update')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export const PipelineMailSettings = ({
  pipelineId,
  pipelineName,
}: {
  pipelineId: string;
  pipelineName: string;
}) => {
  const { integration, loading } = useMailPipelineIntegration(pipelineId);
  const { readiness, loading: readinessLoading } = useMailSendingReadiness();

  if ((loading && !integration) || readinessLoading) {
    return <Spinner containerClassName="py-8" />;
  }

  if (readiness && !readiness.ready && !integration) {
    return <MailSendingRequired reason={readiness.cloudflare?.reason} />;
  }

  return integration ? (
    <PipelineMailConnected
      pipelineId={pipelineId}
      pipelineName={pipelineName}
      integration={integration}
    />
  ) : (
    <PipelineMailConnect pipelineId={pipelineId} />
  );
};
