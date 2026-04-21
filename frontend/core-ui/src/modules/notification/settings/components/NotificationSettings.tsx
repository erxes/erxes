import { Switch } from 'erxes-ui';
import { useNotificationSettingsContext } from '../context/NotificationSettingsProvider';
import { NotificationSettingsChannelChip } from './NotificationSettingsChannelChip';
import { NotificationSettingsModule } from './NotificationSettingsModule';

export const NotificationSettings = () => {
  const { plugin, togglePlugin } = useNotificationSettingsContext();

  return (
    <div className="bg-background min-h-screen">
      <div className="space-y-3 mx-auto px-4 py-10 max-w-2xl">
        <div className="bg-card border border-border rounded-xl transition-opacity duration-200 select-none">
          <div className="flex justify-between items-start gap-4 px-4 py-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm capitalize tracking-tight">
                  {plugin.name}
                </p>
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    plugin.enabled ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                  }`}
                />
              </div>
              <p className="mb-3 text-muted-foreground text-xs">
                Receive notifications from this plugin
              </p>

              <NotificationSettingsChannelChip />
            </div>
            <Switch checked={plugin.enabled} onCheckedChange={togglePlugin} />
          </div>
        </div>

        {/* Events card */}
        <NotificationSettingsModule />
      </div>
    </div>
  );
};
