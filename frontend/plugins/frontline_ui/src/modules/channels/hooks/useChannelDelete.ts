import { useChannelRemove } from '@/channels/hooks/useChannelRemove';
import { toast, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const CHANNELS_PATH = '/frontline/settings/channels';

export const useChannelDelete = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  const { removeChannel, loading } = useChannelRemove();

  const deleteChannel = (channelId: string) =>
    confirm({
      message: t(
        'confirm-delete-channel',
        'Are you sure you want to delete this channel?',
      ),
      options: { confirmationValue: 'delete' },
    }).then(
      () =>
        removeChannel({ variables: { id: channelId } }).then(
          () => navigate(CHANNELS_PATH, { replace: true }),
          (error: Error) =>
            toast({
              title: t('error', 'Error'),
              description: error.message,
              variant: 'destructive',
            }),
        ),
      () => undefined,
    );

  return { deleteChannel, loading };
};
