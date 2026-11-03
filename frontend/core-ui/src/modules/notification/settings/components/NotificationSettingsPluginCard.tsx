import { Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNotificationSettingsContext } from '../context/NotificationSettingsProvider';
import { NotificationSettingsChannelChip } from './NotificationSettingsChannelChip';

/** The plugin's on/off switch and the channels its events may use. */
export const NotificationSettingsPluginCard = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { plugin, togglePlugin } = useNotificationSettingsContext();

  return (
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
            {t('receive-notifications')}
          </p>

          <NotificationSettingsChannelChip />
        </div>
        <Switch checked={plugin.enabled} onCheckedChange={togglePlugin} />
      </div>
    </div>
  );
};
