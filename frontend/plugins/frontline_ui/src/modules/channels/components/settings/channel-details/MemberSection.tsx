import { IChannel } from '@/channels/types';
import { IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const MemberSection = ({ channel }: { channel: IChannel }) => {
  const { t } = useTranslation('frontline');
  const navigate = useNavigate();

  return (
    <div
      className="w-full shrink-0 border border-muted-foreground/15 rounded-md hover:bg-sidebar/50 cursor-pointer"
      onClick={() =>
        navigate(`/settings/frontline/channels/${channel._id}/members`)
      }
    >
      <section className="w-full p-4">
        <div className="flex items-center justify-between">
          <p>{t('manage-channel-members')}</p>

          <div className="flex items-center gap-2">
            <p className="text-xs">
              {t('member', { count: channel.memberCount })}
            </p>
            <IconChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>
    </div>
  );
};
