import { SettingsPanelFooter } from '@/settings/components/SettingsPanelForm';
import { ChannelForm } from '@/channels/components/settings/channels-list/ChannelForm';
import { useChannelsForm } from '@/channels/hooks/useChannelsForm';
import { IChannelDetail, TChannelForm } from '@/channels/types';
import { useChannelUpdate } from '@/channels/hooks/useChannelUpdate';
import { channelPanelDraftsState } from '@/channels/states';
import { usePanelFormDraft } from '@/shared/hooks/usePanelFormDraft';
import { Button, Form, Spinner, useToast } from 'erxes-ui';
import { SubmitHandler } from 'react-hook-form';
import React from 'react';
import { useTranslation } from 'react-i18next';

type TUpdateChannel = Pick<
  IChannelDetail,
  '_id' | 'name' | 'description' | 'icon'
>;

const InlineFormFooter = ({
  dirty,
  busy,
  onDiscard,
}: {
  dirty: boolean;
  busy: boolean;
  onDiscard: () => void;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });

  return (
    <div className="flex items-center gap-2 border-t bg-muted/30 px-4 py-2.5">
      <span
        className="mr-auto text-xs text-muted-foreground"
        aria-live="polite"
      >
        {dirty
          ? t('unsaved-changes', 'Unsaved changes')
          : t('all-changes-saved', 'All changes saved')}
      </span>
      <Button
        type="button"
        variant="ghost"
        disabled={!dirty || busy}
        onClick={onDiscard}
      >
        {t('discard', 'Discard')}
      </Button>
      <Button type="submit" disabled={!dirty || busy}>
        {busy && <Spinner size="sm" />}
        {t('save-changes', 'Save changes')}
      </Button>
    </div>
  );
};

export const UpdateChannelForm = ({
  channel,
  onCancel,
  onCompleted,
  readOnly = false,
}: {
  channel: TUpdateChannel;
  onCancel?: () => void;
  onCompleted?: () => void;
  readOnly?: boolean;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { toast } = useToast();
  const { updateChannel, loading } = useChannelUpdate();
  const values: TChannelForm = {
    name: channel.name,
    description: channel.description ?? undefined,
    icon: channel.icon,
  };
  const form = useChannelsForm({
    defaultValues: values,
  });
  const { dirtyFields, isDirty, isSubmitting } = form.formState;
  const { clearDraft, markSaved, isActive, beginSave, endSave, saving } =
    usePanelFormDraft({
      form,
      recordKey: channel._id,
      values,
      draftsState: channelPanelDraftsState,
    });
  const busy = loading || saving || isSubmitting;

  const submitHandler: SubmitHandler<TChannelForm> = React.useCallback(
    async (data) => {
      const saveId = beginSave();
      if (saveId === undefined) return;
      const submittedValues = structuredClone(form.getValues());
      await updateChannel({
        variables: {
          id: channel._id,
          ...(dirtyFields.name && { name: data.name }),
          ...(dirtyFields.description && { description: data.description }),
          ...(dirtyFields.icon && { icon: data.icon }),
        },
        onCompleted: () => {
          endSave(saveId);
          toast({ title: t('channel-saved', 'Channel saved') });
          if (markSaved(data, submittedValues) && isActive()) onCompleted?.();
        },
        onError: (error) => {
          endSave(saveId);
          toast({
            title: t('error', 'Error'),
            description: error.message,
            variant: 'destructive',
          });
        },
      });
    },
    [
      updateChannel,
      beginSave,
      endSave,
      dirtyFields,
      channel._id,
      onCompleted,
      form,
      markSaved,
      isActive,
      t,
      toast,
    ],
  );

  if (onCancel) {
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submitHandler)}
          className="flex flex-1 min-h-0 flex-col"
        >
          <div className="flex-1 min-h-0 overflow-y-auto p-4">
            <ChannelForm form={form} withMembers={false} disabled={readOnly} />
          </div>
          <SettingsPanelFooter
            onCancel={() => {
              clearDraft();
              onCancel();
            }}
            cancelLabel={t('cancel', 'Cancel')}
            submitLabel={t('save-changes', 'Save changes')}
            loading={busy}
            disabled={readOnly || !isDirty}
          />
        </form>
      </Form>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitHandler)}
        className="overflow-hidden rounded-lg border bg-background"
      >
        <div className="p-4">
          <ChannelForm form={form} withMembers={false} disabled={readOnly} />
        </div>
        {!readOnly && (
          <InlineFormFooter
            dirty={isDirty}
            busy={busy}
            onDiscard={() => form.reset(values)}
          />
        )}
      </form>
    </Form>
  );
};
