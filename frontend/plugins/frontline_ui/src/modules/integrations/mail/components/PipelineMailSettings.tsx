import { zodResolver } from '@hookform/resolvers/zod';
import { IconAlertTriangle, IconMail, IconTrash } from '@tabler/icons-react';
import {
  Alert,
  Button,
  Combobox,
  Form,
  InfoCard,
  PopoverScoped,
  Spinner,
  useConfirm,
} from 'erxes-ui';
import { useState } from 'react';
import { Control, useForm, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useStore } from 'jotai';

import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { SelectTriggerTicket } from '@/ticket/components/ticket-selects/SelectTicket';

import {
  MAIL_SENDER_NAME_MAX_LENGTH,
  MailAddressCallout,
  MailFormField,
  MailSenderPreview,
} from './MailIntegrationForm';
import { MailSendingRequired } from './MailSendingRequired';
import { PipelineForwardVerification } from './PipelineForwardVerification';
import {
  IMailPipelineIntegration,
  useMailPipelineConnect,
  useMailPipelineDisconnect,
  useMailPipelineIntegration,
  useMailPipelineUpdate,
} from '../hooks/useMailPipelineIntegration';
import { useMailSendingReadiness } from '../hooks/useMailSendingReadiness';
import { usePanelFormDraft } from '@/shared/hooks/usePanelFormDraft';
import { pipelineMailPanelDraftsState } from '@/pipelines/states/pipelineStates';

const MAIL_HEALTH_UNHEALTHY = 'unHealthy';

const pipelineMailSchema = z.object({
  senderName: z.string().trim().max(MAIL_SENDER_NAME_MAX_LENGTH).optional(),
  forwardFrom: z.string().email().optional().or(z.literal('')),
  statusId: z.string().optional(),
});

type PipelineMailValues = z.infer<typeof pipelineMailSchema>;

const PIPELINE_MAIL_FIELDS = [
  {
    name: 'senderName' as const,
    label: 'sender-name',
    placeholder: 'sender-name-placeholder',
    description: 'sender-name-description',
  },
  {
    name: 'forwardFrom' as const,
    label: 'forwarding-address',
    placeholder: 'forwarding-address-placeholder',
    description: 'pipeline-mail-forward-from-description',
    descriptionFallback:
      'Only needed when mail reaches this pipeline by forwarding. Naming the mailbox it comes from holds your provider\u2019s confirmation here instead of opening a ticket, and stops every forwarded message being flagged as an unverified sender.',
  },
];

const toPipelineMailValues = (
  integration: IMailPipelineIntegration | null,
): PipelineMailValues => ({
  senderName: integration?.senderName ?? '',
  forwardFrom: integration?.forwardFrom ?? '',
  statusId: integration?.statusId ?? '',
});

const usePipelineMailForm = (
  pipelineId: string,
  integration: IMailPipelineIntegration | null,
): {
  form: UseFormReturn<PipelineMailValues>;
  draft: ReturnType<typeof usePanelFormDraft<PipelineMailValues>>;
  recordKey: string;
} => {
  const values = toPipelineMailValues(integration);
  const recordKey = `${pipelineId}~${integration?._id ?? 'new'}`;
  const form = useForm<PipelineMailValues>({
    resolver: zodResolver(pipelineMailSchema),
    defaultValues: values,
  });
  const draft = usePanelFormDraft({
    form,
    recordKey,
    values,
    draftsState: pipelineMailPanelDraftsState,
  });

  return { form, draft, recordKey };
};

const PipelineMailStatusSelect = ({
  pipelineId,
  value,
  onValueChange,
}: {
  pipelineId: string;
  value: string;
  onValueChange: (statusId: string) => void;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const [open, setOpen] = useState(false);

  return (
    <SelectStatusTicket.Provider
      value={value}
      pipelineId={pipelineId}
      onValueChange={(statusId) => {
        onValueChange(statusId);
        setOpen(false);
      }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant="form">
          <SelectStatusTicket.Value
            placeholder={t(
              'pipeline-mail-status-default',
              'First status of this pipeline',
            )}
          />
        </SelectTriggerTicket>
        <Combobox.Content>
          <SelectStatusTicket.Content />
        </Combobox.Content>
      </PopoverScoped>
    </SelectStatusTicket.Provider>
  );
};

const PipelineMailStatusField = ({
  pipelineId,
  control,
}: {
  pipelineId: string;
  control: Control<PipelineMailValues>;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });

  return (
    <Form.Field
      name="statusId"
      control={control}
      render={({ field }) => (
        <Form.Item className="space-y-1 [&_button]:h-9 [&_button]:w-full [&_button]:max-w-none">
          <Form.Label className="text-sm font-normal text-muted-foreground">
            {t('pipeline-mail-status', 'Ticket status')}
          </Form.Label>
          <PipelineMailStatusSelect
            pipelineId={pipelineId}
            value={field.value ?? ''}
            onValueChange={field.onChange}
          />
          <Form.Description>
            {t(
              'pipeline-mail-status-description',
              'The status a new mail ticket opens in. A reply that threads onto an existing ticket leaves its status unchanged.',
            )}
          </Form.Description>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

const PipelineMailFields = ({
  pipelineId,
  form,
}: {
  pipelineId: string;
  form: ReturnType<typeof usePipelineMailForm>['form'];
}) => (
  <>
    <PipelineMailStatusField pipelineId={pipelineId} control={form.control} />
    {PIPELINE_MAIL_FIELDS.map((field) => (
      <MailFormField key={field.name} {...field} control={form.control} />
    ))}
  </>
);

const PipelineMailConnect = ({ pipelineId }: { pipelineId: string }) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const store = useStore();
  const { form, draft, recordKey } = usePipelineMailForm(pipelineId, null);
  const { connectPipelineMail, loading } = useMailPipelineConnect();
  const onSubmit = async (submitted: PipelineMailValues): Promise<void> => {
    const saveId = draft.beginSave();
    if (saveId === undefined) return;
    const submittedValues = structuredClone(form.getValues());
    const completeDraft = draft.captureUpdate();
    try {
      const result = await connectPipelineMail(pipelineId, submitted);
      const saved = result.data?.mailPipelineConnect;
      if (saved?._id && saved.pipelineId === pipelineId) {
        completeDraft((latest) => latest);
        draft.markSaved(toPipelineMailValues(saved), submittedValues);
        store.set(pipelineMailPanelDraftsState, (previous) => {
          const remaining = previous[recordKey];
          if (!remaining) return previous;
          const savedKey = `${pipelineId}~${saved._id}`;
          const existing = previous[savedKey];
          const values = {
            ...(existing?.defaultValues ?? remaining.defaultValues),
          };
          for (const source of [remaining, existing]) {
            if (!source) continue;
            for (const field of [
              'senderName',
              'forwardFrom',
              'statusId',
            ] as const) {
              if (source.values[field] !== source.defaultValues[field])
                values[field] = source.values[field];
            }
          }
          return {
            ...previous,
            [savedKey]: existing
              ? { ...existing, values, submittedValues: existing.values }
              : remaining,
          };
        });
        draft.clearDraft();
      } else completeDraft((latest) => latest);
    } catch {
      completeDraft((latest) => latest);
    } finally {
      draft.endSave(saveId);
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <InfoCard
          title={t('pipeline-mail', 'Mail settings')}
          description={t(
            'pipeline-mail-description',
            'Give this pipeline its own address. Mail sent there opens a ticket here, and replies go back from the same address. It stays out of the inbox and out of the channel.',
          )}
        >
          <InfoCard.Content className="grid grid-cols-1 gap-3">
            <PipelineMailFields pipelineId={pipelineId} form={form} />
          </InfoCard.Content>
        </InfoCard>
        <div className="flex justify-end border-t pt-5">
          <Button type="submit" disabled={loading || draft.saving}>
            {loading || draft.saving ? <Spinner /> : <IconMail />}
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
  waitingForForwardVerification,
}: {
  pipelineId: string;
  pipelineName: string;
  integration: IMailPipelineIntegration;
  waitingForForwardVerification: boolean;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const { confirm } = useConfirm();
  const { form, draft } = usePipelineMailForm(pipelineId, integration);
  const { updatePipelineMail, loading: updating } = useMailPipelineUpdate();
  const { disconnectPipelineMail, loading: disconnecting } =
    useMailPipelineDisconnect();
  const { dirtyFields } = form.formState;
  const onSubmit = async (values: PipelineMailValues): Promise<void> => {
    const saveId = draft.beginSave();
    if (saveId === undefined) return;
    const submittedValues = structuredClone(form.getValues());
    try {
      const result = await updatePipelineMail(pipelineId, {
        ...(dirtyFields.senderName && { senderName: values.senderName }),
        ...(dirtyFields.forwardFrom && { forwardFrom: values.forwardFrom }),
        ...(dirtyFields.statusId && { statusId: values.statusId }),
      });
      const saved = result.data?.mailPipelineUpdate;
      if (saved?._id === integration._id && saved.pipelineId === pipelineId)
        draft.markSaved(toPipelineMailValues(saved), submittedValues);
    } catch {
      return;
    } finally {
      draft.endSave(saveId);
    }
  };

  const senderName =
    form.watch('senderName')?.trim() || integration.name || pipelineName;

  const onDisconnect = () =>
    confirm({
      message: t(
        'pipeline-mail-disconnect-confirm',
        'Mail sent to this address will stop opening tickets and the address is released. Mail already on tickets stays.',
      ),
    }).then(async () => {
      const result = await disconnectPipelineMail(pipelineId);
      if (result.data?.mailPipelineDisconnect) draft.clearDraft();
    });

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
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

            <MailAddressCallout
              address={integration.address ?? ''}
              description="pipeline-mail-forward-here-description"
              descriptionFallback="Set up forwarding from your mailbox to this address, or write to it directly. Anything sent there opens a ticket in this pipeline."
            />

            <PipelineForwardVerification
              pipelineId={pipelineId}
              integration={integration}
              waiting={waitingForForwardVerification}
            />

            <PipelineMailFields pipelineId={pipelineId} form={form} />

            <MailSenderPreview
              senderName={senderName}
              address={integration.address ?? ''}
            />
          </InfoCard.Content>
        </InfoCard>

        <div className="flex justify-between border-t pt-5">
          <Button
            type="button"
            variant="destructive"
            disabled={disconnecting || updating || draft.saving}
            onClick={onDisconnect}
          >
            {disconnecting ? <Spinner /> : <IconTrash />}
            {t('pipeline-mail-disconnect', 'Remove mail address')}
          </Button>
          <Button
            type="submit"
            disabled={updating || disconnecting || draft.saving}
          >
            {updating || draft.saving ? <Spinner /> : null}
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
  const { integration, waitingForForwardVerification, loading } =
    useMailPipelineIntegration(pipelineId);
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
      waitingForForwardVerification={waitingForForwardVerification}
    />
  ) : (
    <PipelineMailConnect pipelineId={pipelineId} />
  );
};
