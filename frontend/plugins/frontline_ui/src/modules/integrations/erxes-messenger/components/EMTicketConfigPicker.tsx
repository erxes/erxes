import { IconPlus } from '@tabler/icons-react';
import { Button, Checkbox, Form, Spinner, cn, toast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigsForm } from '@/pipelines/components/configs/components/ConfigsForm';
import { useGetTicketConfigs } from '@/pipelines/components/configs/hooks/useGetTicketConfigs';
import { usePipelineConfigForm } from '@/pipelines/components/configs/hooks/usePipelineConfigForm';
import { useSaveTicketsConfig } from '@/pipelines/components/configs/hooks/useSaveTicketsConfig';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';

/** Creates a ticket config of this channel without leaving the messenger. */
const EMTicketConfigCreate = ({
  channelId,
  onCreated,
  onCancel,
}: {
  channelId: string;
  onCreated: (configId: string) => void;
  onCancel?: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const { methods } = usePipelineConfigForm({ channelId });
  const { saveTicketsConfig, loading } = useSaveTicketsConfig();

  // A button, not a submit: this form sits inside the messenger's own form.
  const create = methods.handleSubmit((input) =>
    saveTicketsConfig({
      variables: { input },
      onCompleted: (data) => {
        const configId = data?.ticketSaveConfig?.id;

        toast({
          title: t('ticket-config-created', 'Ticket config created'),
          variant: 'success',
        });
        methods.reset();

        if (configId) {
          onCreated(configId);
        }
      },
      onError: (error) =>
        toast({
          title: t('error', 'Error'),
          description: error.message,
          variant: 'destructive',
        }),
    }),
  );

  return (
    <Form {...methods}>
      <div className="flex flex-col gap-4 rounded-lg border border-dashed bg-muted/40 p-4">
        <Form.Field
          control={methods.control}
          name="pipelineId"
          render={({ field }) => (
            <Form.Item>
              <SelectPipeline.FormItem
                value={field.value ?? ''}
                onValueChange={field.onChange}
                form={methods}
                label={t('pipeline', 'Pipeline')}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <ConfigsForm form={methods} />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              {t('cancel', 'Cancel')}
            </Button>
          )}
          <Button type="button" onClick={create} disabled={loading}>
            {loading && <Spinner size="sm" />}
            {t('create-and-select', 'Create and select')}
          </Button>
        </div>
      </div>
    </Form>
  );
};

/**
 * The ticket configs of the messenger's channel, each a button in the widget's
 * Tickets menu. With none yet, the create form opens in place.
 */
export const EMTicketConfigPicker = ({
  channelId,
  value,
  onChange,
}: {
  channelId?: string;
  value: string[];
  onChange: (configIds: string[]) => void;
}) => {
  const { t } = useTranslation('frontline');
  const [creating, setCreating] = useState(false);
  const { ticketConfigs, loading } = useGetTicketConfigs({
    variables: channelId ? { channelId } : undefined,
  });
  const configs = ticketConfigs ?? [];

  if (!channelId) {
    return (
      <p className="text-sm text-muted-foreground">
        {t(
          'ticket-config-needs-channel',
          'Save the messenger in a channel first to configure tickets.',
        )}
      </p>
    );
  }

  if (loading) {
    return <Spinner containerClassName="py-6" />;
  }

  const toggle = (configId: string, checked: boolean) =>
    onChange(
      checked
        ? [...new Set([...value, configId])]
        : value.filter((id) => id !== configId),
    );

  const onCreated = (configId: string) => {
    onChange([...new Set([...value, configId])]);
    setCreating(false);
  };

  if (!configs.length) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {t(
            'ticket-config-empty-create',
            'This channel has no ticket config yet. Create one here; it shows as a button in the widget Tickets menu.',
          )}
        </p>
        <EMTicketConfigCreate channelId={channelId} onCreated={onCreated} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        {t('ticket-config-display-tip')}
      </p>
      {configs.map((config) => {
        const checked = value.includes(config.id);

        return (
          <label
            key={config.id}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm',
              checked && 'border-primary bg-primary/5',
            )}
          >
            <Checkbox
              checked={checked}
              onCheckedChange={(next) => toggle(config.id, next === true)}
            />
            <span className="flex-1 truncate">{config.name}</span>
          </label>
        );
      })}
      {creating ? (
        <EMTicketConfigCreate
          channelId={channelId}
          onCreated={onCreated}
          onCancel={() => setCreating(false)}
        />
      ) : (
        <Button
          type="button"
          variant="secondary"
          className="self-start"
          onClick={() => setCreating(true)}
        >
          <IconPlus />
          {t('new-ticket-config', 'New ticket config')}
        </Button>
      )}
    </div>
  );
};
