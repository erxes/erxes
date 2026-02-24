import { IconBox, IconDeviceMobile, IconMail } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { useNotificationSettingsContext } from '../context/NotificationSettingsProvider';

const NOTIFICATION_CHANNELS = [
  {
    key: 'email',
    label: 'Email',
    icon: IconMail,
    available: true,
  },
  {
    key: 'mobile',
    label: 'Mobile',
    icon: IconDeviceMobile,
    available: false,
  },
  {
    key: 'other',
    label: 'Other',
    icon: IconBox,
    available: false,
  },
];

type NotificationChannel = {
  key: string;
  label: string;
  icon: any;
  available: boolean;
};

const ChannelChip = ({
  channel,
}: {
  channel: (typeof NOTIFICATION_CHANNELS)[0];
}) => {
  const { key, label, icon: Icon, available } = channel;

  const { plugin, toggleChannel } = useNotificationSettingsContext();

  if (!available) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-border border-dashed rounded text-[11px] text-muted-foreground/40 cursor-default select-none">
        <Icon size={11} strokeWidth={1.5} />
        {label}
        <span className="font-medium text-[9px] tracking-wide">soon</span>
      </span>
    );
  }

  return (
    <Button
      variant="ghost"
      disabled={!plugin.enabled}
      onClick={() => toggleChannel(key)}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 border font-medium text-[11px] transition-all duration-150',
        plugin.channels?.includes(key)
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:bg-muted/60',
        !plugin.enabled && 'pointer-events-none opacity-60',
      )}
    >
      <Icon size={10} />
      {label}
    </Button>
  );
};

export const NotificationSettingsChannelChip = () => {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {NOTIFICATION_CHANNELS.map((channel, index) => (
        <ChannelChip key={index} channel={channel} />
      ))}
    </div>
  );
};
