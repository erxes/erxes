import { IconComponent, Switch } from 'erxes-ui';
import { useNotificationSettingsContext } from '../context/NotificationSettingsProvider';
import { NotificationSettingsEvents } from './NotificationSettingsEvents';

export const NotificationSettingsModule = () => {
  const { plugin, module, events, toggleModule } =
    useNotificationSettingsContext();

  const activeEvents =
    events?.filter((e) => e.enabled && module.enabled)?.length || 0;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden transition-opacity duration-200 select-none">
      <div
        className={`${plugin.enabled ? '' : 'pointer-events-none opacity-60'}`}
      >
        <div className="flex justify-between items-center gap-3 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex justify-center items-center bg-muted rounded-lg w-8 h-8 transition-colors">
              <IconComponent name={module.icon} size={16} strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-semibold text-[13px] leading-none">
                {module.description}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {activeEvents} of {events.length} events active
              </p>
            </div>
          </div>
          <Switch checked={module.enabled} onCheckedChange={toggleModule} />
        </div>

        <NotificationSettingsEvents />
      </div>
    </div>
  );
};
