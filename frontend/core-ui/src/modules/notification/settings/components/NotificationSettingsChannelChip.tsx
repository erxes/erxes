import { IconDeviceMobile, IconMail } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { useNotificationSettingsContext } from '../context/NotificationSettingsProvider';
import { useTranslation } from 'react-i18next';

export const NOTIFICATION_CHANNELS = [
  {
    key: 'email',
    labelKey: 'channel-email',
    icon: IconMail,
  },
  {
    key: 'mobile',
    labelKey: 'channel-mobile',
    icon: IconDeviceMobile,
  },
];

const ChannelChip = ({
  channel,
}: {
  channel: (typeof NOTIFICATION_CHANNELS)[0];
}) => {
  const { key, labelKey, icon: Icon } = channel;

  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { plugin, toggleChannel } = useNotificationSettingsContext();
  const active = plugin.channels?.includes(key);

  return (
    <Button
      variant="ghost"
      disabled={!plugin.enabled}
      aria-pressed={active}
      onClick={() => toggleChannel(key)}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 border font-medium text-[11px] transition-colors duration-150',
        active
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:bg-muted/60',
        !plugin.enabled && 'pointer-events-none opacity-60',
      )}
    >
      <Icon size={12} />
      {t(labelKey)}
    </Button>
  );
};

export const NotificationSettingsChannelChip = () => {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {NOTIFICATION_CHANNELS.map((channel) => (
        <ChannelChip key={channel.key} channel={channel} />
      ))}
    </div>
  );
};
