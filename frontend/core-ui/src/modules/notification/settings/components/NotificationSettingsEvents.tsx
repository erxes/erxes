import { Button, cn, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNotificationSettingsContext } from '../context/NotificationSettingsProvider';
import { NOTIFICATION_CHANNELS } from './NotificationSettingsChannelChip';

export const NotificationSettingsEvents = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { plugin, module, events, toggleEventChannel } =
    useNotificationSettingsContext();

  return (
    <Tooltip.Provider>
      <div
        className={cn(
          'border-t px-2 py-2 transition-opacity duration-200',
          !module.enabled && 'pointer-events-none opacity-60',
        )}
      >
        {events.map((event) => {
          const isOn = !!(module.enabled && event.enabled);

          return (
            <div
              key={event.name}
              className="flex justify-between items-center gap-4 hover:bg-muted/50 px-2 py-2 rounded-lg transition-colors duration-150"
            >
              <div className="min-w-0">
                <p
                  className={cn(
                    'font-medium text-xs leading-snug transition-colors',
                    !isOn && 'text-muted-foreground',
                  )}
                >
                  {event.title}
                </p>
                {event.description && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                    {event.description}
                  </p>
                )}
              </div>

              <div className="flex flex-none gap-1">
                {NOTIFICATION_CHANNELS.map(({ key, labelKey, icon: Icon }) => {
                  // the sender only delivers on channels picked for the plugin
                  const available = plugin.channels.includes(key);
                  const active =
                    available && isOn && !event.mutedChannels?.includes(key);

                  return (
                    <Tooltip key={key}>
                      <Tooltip.Trigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-pressed={active}
                          // aria-disabled, not disabled, so the tooltip still opens
                          aria-disabled={!available}
                          aria-label={`${event.title}: ${t(labelKey)}`}
                          onClick={() =>
                            available && toggleEventChannel(event.name, key)
                          }
                          className={cn(
                            'transition-colors duration-150',
                            active &&
                              'bg-primary/10 text-primary hover:bg-primary/15',
                            !active &&
                              available &&
                              'text-muted-foreground/50 hover:text-foreground',
                            !available &&
                              'text-muted-foreground/25 hover:bg-transparent cursor-not-allowed',
                          )}
                        >
                          <Icon />
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        {available
                          ? t(labelKey)
                          : t('channel-off-hint', { channel: t(labelKey) })}
                      </Tooltip.Content>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Tooltip.Provider>
  );
};
