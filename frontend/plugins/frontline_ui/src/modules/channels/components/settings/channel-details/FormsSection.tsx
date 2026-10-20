import { IChannelDetail } from '@/channels/types';
import { useFormsTotalCount } from '@/forms/hooks/useFormsTotalCount';
import { IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const FormsSection = ({ channel }: { channel: IChannelDetail }) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const navigate = useNavigate();
  const { total } = useFormsTotalCount({
    variables: {
      channelId: channel._id,
    },
  });

  return (
    <div
      className="w-full shrink-0 border border-muted-foreground/15 rounded-md hover:bg-sidebar/50 cursor-pointer"
      onClick={() =>
        navigate(`/frontline/settings/channels/${channel._id}/forms`)
      }
    >
      <section className="w-full p-4">
        <div className="flex items-center justify-between">
          <p>{t('manage-channel-forms', 'Manage channel forms')}</p>

          <div className="flex items-center gap-2">
            <p className="text-xs">{t('form', 'Form', { count: total })}</p>
            <IconChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>
    </div>
  );
};
