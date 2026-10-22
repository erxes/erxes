import { IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { IChannelDetail } from '@/channels/types';
import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';
import { useTranslation } from 'react-i18next';

export const ResponseSection = ({ channel }: { channel: IChannelDetail }) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const navigate = useNavigate();
  const { totalCount } = useGetResponses({
    variables: { filter: { channelId: channel._id, limit: 1 } },
  });

  const count = totalCount ?? 0;

  return (
    <div
      className="w-full border border-muted-foreground/15 rounded-md hover:bg-sidebar/50 cursor-pointer"
      onClick={() =>
        navigate(`/frontline/settings/channels/${channel._id}/response`)
      }
    >
      <section className="w-full p-4">
        <div className="flex items-center justify-between">
          <p>
            {t(
              'manage-channel-response-templates',
              'Manage channel response templates',
            )}
          </p>

          <div className="flex items-center gap-2">
            <p className="text-xs">{t('response', { count })}</p>
            <IconChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>
    </div>
  );
};
