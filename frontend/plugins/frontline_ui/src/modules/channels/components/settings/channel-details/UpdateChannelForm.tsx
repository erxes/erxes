import { useChannelsForm } from '@/channels/hooks/useChannelsForm';
import { IChannelDetail, TChannelForm } from '@/channels/types';
import { useChannelUpdate } from '@/channels/hooks/useChannelUpdate';
import { ChannelForm } from '@/channels/components/settings/channels-list/ChannelForm';
import { SettingsPanelFooter } from '@/settings/components/SettingsPanelForm';
import { Button, Form, Spinner, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const UpdateChannelForm = ({
  channel,
  onCancel,
  onCompleted,
  panel = false,
}: {
  channel: Pick<IChannelDetail, '_id' | 'name' | 'description' | 'icon'>;
  onCancel?: () => void;
  onCompleted?: () => void;
  panel?: boolean;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { toast } = useToast();
  const { updateChannel, loading } = useChannelUpdate();
  const form = useChannelsForm({
    defaultValues: {
      name: channel.name,
      description: channel.description ?? '',
      icon: channel.icon,
    },
  });
  const onSubmit = (values: TChannelForm) => {
    updateChannel({
      variables: {
        id: channel._id,
        name: values.name,
        description: values.description,
        icon: values.icon,
      },
      onCompleted: () => {
        toast({ title: t('success', 'Success!') });
        onCompleted?.();
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
        <div
          className={panel ? 'flex-1 min-h-0 overflow-y-auto p-3' : 'flex-1'}
        >
          <ChannelForm form={form} includeMembers={false} panel={panel} />
        </div>
        {onCancel ? (
          <SettingsPanelFooter
            onCancel={onCancel}
            cancelLabel={t('cancel', 'Cancel')}
            submitLabel={t('update', 'Update')}
            loading={loading}
          />
        ) : (
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading && <Spinner size="sm" />}
              {t('update', 'Update')}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};
