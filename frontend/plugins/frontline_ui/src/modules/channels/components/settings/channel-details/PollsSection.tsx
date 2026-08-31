import { IconChevronRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IChannel } from '@/channels/types';
import { usePollTotalCount } from '@/poll/hooks/usePollTotalCount';

export const PollsSection = ({ channel }: { channel: IChannel }) => {
  const { t } = useTranslation('frontline');
  const navigate = useNavigate();
  const { totalCount } = usePollTotalCount({
    variables: {
      channelId: channel._id,
    },
  });

  return (
    <div
      className="w-full shrink-0 border border-muted-foreground/15 rounded-md hover:bg-sidebar/50 cursor-pointer"
      onClick={() =>
        navigate(`/settings/frontline/channels/${channel._id}/polls`)
      }
    >
      <section className="w-full p-4">
        <div className="flex items-center justify-between">
          <p>{t('manage-channel-polls')}</p>

          <div className="flex items-center gap-2">
            <p className="text-xs">{t('poll', { count: totalCount || 0 })}</p>
            <IconChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>
    </div>
  );
};
