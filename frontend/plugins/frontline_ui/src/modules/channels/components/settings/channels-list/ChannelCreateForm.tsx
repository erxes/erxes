import { useChannelAdd } from '@/channels/hooks/useChannelAdd';
import { useChannelsForm } from '@/channels/hooks/useChannelsForm';
import { TChannelForm } from '@/channels/types';
import { SettingsPanelFooter } from '@/settings/components/SettingsPanelForm';
import { CHANNEL_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { Form, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';
import { ChannelForm } from './ChannelForm';

export const ChannelCreateForm = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { toast } = useToast();
  const { close, openRecord } = useSidePanel();
  const form = useChannelsForm({});
  const { addChannel, loading } = useChannelAdd();
  const onSubmit = (values: TChannelForm) => {
    addChannel({
      variables: { ...values, scope: 'team' },
      onCompleted: ({ channelAdd }) => {
        toast({ title: t('success', 'Success!') });
        form.reset();
        if (channelAdd?._id)
          openRecord(
            { contentType: CHANNEL_CONTENT_TYPE, contentId: channelAdd._id },
            { replace: true },
          );
        else close();
      },
      onError: (error) =>
        toast({
          title: t('error', 'Error'),
          description: error.message,
          variant: 'destructive',
        }),
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
          onCancel={close}
          cancelLabel={t('cancel', 'Cancel')}
          submitLabel={t('create', 'Create')}
          loading={loading}
        />
      </form>
    </Form>
  );
};
