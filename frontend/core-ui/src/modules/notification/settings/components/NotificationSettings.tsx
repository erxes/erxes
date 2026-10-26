import { NotificationSettingsModule } from './NotificationSettingsModule';
import { NotificationSettingsPluginCard } from './NotificationSettingsPluginCard';

export const NotificationSettings = () => {
  return (
    <div className="bg-background min-h-screen">
      <div className="space-y-3 mx-auto px-4 py-10 max-w-2xl">
        <NotificationSettingsPluginCard />

        {/* Events card */}
        <NotificationSettingsModule />
      </div>
    </div>
  );
};
