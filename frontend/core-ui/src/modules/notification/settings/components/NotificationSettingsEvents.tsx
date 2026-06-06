import { Switch } from 'erxes-ui';
import { useNotificationSettingsContext } from '../context/NotificationSettingsProvider';

export const NotificationSettingsEvents = () => {
  const { plugin, module, events, toggleEvent } =
    useNotificationSettingsContext();

  return (
    <div className="space-y-0.5 px-4 pb-3 transition-opacity duration-200">
      <div className="mb-2 bg-border/60 h-px" />
      <div
        className={`${plugin.enabled && !module.enabled ? 'pointer-events-none opacity-60' : ''}`}
      >
        {events.map((event) => (
          <div
            key={event.name}
            className={`flex items-center justify-between gap-4 px-3 py-2.5 rounded-lg transition-all duration-150 hover:bg-muted/50`}
          >
            <div className="flex items-start gap-2.5 pt-1 min-w-0">
              <div className="min-w-0">
                <p className="font-medium text-xs leading-snug">
                  {event.title}
                </p>
                {event.description && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
            <Switch
              checked={module.enabled && event.enabled}
              onCheckedChange={(checked) => toggleEvent(event.name, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
