import { usePanelFormDraft } from '@/shared/hooks/usePanelFormDraft';
import { channelPanelDraftsState } from '@/channels/states';
import { useChannelAdd } from '@/channels/hooks/useChannelAdd';
import { useChannelsForm } from '@/channels/hooks/useChannelsForm';
import { TChannelForm } from '@/channels/types';
import { SettingsPanelFooter } from '@/settings/components/SettingsPanelForm';
import { CHANNEL_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { Form, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { ChannelForm } from './ChannelForm';

/** Creates a team channel from the active settings panel. */
export const ChannelCreateForm = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { toast } = useToast();
  const panel = useSidePanel();
  const { close } = panel;
  const panelRef = useRef<typeof panel | null>(panel);
  useEffect(() => {
    panelRef.current = panel;
    return () => {
      panelRef.current = null;
    };
  }, [panel]);
  const navigate = useNavigate();
  const values: TChannelForm = {
    name: '',
    description: '',
    memberIds: [],
    scope: 'team',
  };
  const form = useChannelsForm({ defaultValues: values });
  const {
    clearDraft,
    markSaved,
    isActive,
    captureUpdate,
    beginSave,
    endSave,
    saving,
  } = usePanelFormDraft({
    form,
    recordKey: 'new',
    values,
    draftsState: channelPanelDraftsState,
    isNew: true,
  });
  const cancel = () => {
    clearDraft();
    close();
  };
  const { addChannel, loading } = useChannelAdd();
  /** Saves the channel and navigates only while this create panel is active. */
  const onSubmit = (data: TChannelForm) => {
    const saveId = beginSave();
    if (saveId === undefined) return undefined;
    const completeDraft = captureUpdate();
    return addChannel({
      // No scope is sent: this form only creates shared channels and the API
      // defaults to `team`. A personal channel is provisioned on demand when
      // its settings page is opened or a personal mailbox is connected.
      variables: { ...data },
      onCompleted: ({ channelAdd }) => {
        toast({ title: t('success', 'Success!') });
        endSave(saveId);
        completeDraft(() => values);
        markSaved(values);
        if (!isActive()) return;
        const currentPanel = panelRef.current;
        if (
          currentPanel?.record?.contentType !== CHANNEL_CONTENT_TYPE ||
          currentPanel.record.contentId !== 'new'
        )
          return;
        currentPanel.close();
        if (channelAdd)
          navigate(`/frontline/settings/channels/${channelAdd._id}`);
      },
      onError: (error) => {
        completeDraft((latest) => latest);
        endSave(saveId);
        toast({
          title: t('error', 'Error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };
  return (
    <Form {...form}>
      <form
        className="flex flex-1 min-h-0 flex-col"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-3">
          <ChannelForm form={form} panel />
        </div>
        <SettingsPanelFooter
          onCancel={cancel}
          cancelLabel={t('cancel', 'Cancel')}
          submitLabel={t('create', 'Create')}
          loading={loading || saving}
        />
      </form>
    </Form>
  );
};
