import { useNotificationPluginsTypes } from '@/notification/hooks/useNotificationPluginsTypes';
import { useNotificationSettings } from '@/notification/hooks/useNotificationSettings';
import { Button, Collapsible, ScrollArea } from 'erxes-ui';
import { NotificationSettingsModules } from './NotificationSettingsModules';

export const NotificationSettingsPlugins = () => {
  const { pluginsNotifications } = useNotificationPluginsTypes();

  return (
    <div className="flex flex-auto overflow-hidden">
      <ScrollArea className="flex-auto">
        <div className="m-4">
          <div className="max-w-lg mx-auto flex flex-col gap-8">
            {pluginsNotifications.map(({ pluginName, modules }) => (
              <Collapsible
                defaultOpen={true}
                open={true}
                onOpenChange={() => {}}
              >
                <Collapsible.Trigger asChild>
                  <Button
                    variant="secondary"
                    className="w-full justify-start capitalize"
                  >
                    <Collapsible.TriggerIcon />
                    {pluginName}
                  </Button>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <NotificationSettingsModules
                    key={pluginName}
                    plugin={pluginName}
                    modules={modules}
                  />
                </Collapsible.Content>
              </Collapsible>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
