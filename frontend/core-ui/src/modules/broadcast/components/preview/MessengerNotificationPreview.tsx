import { IconBellRinging } from '@tabler/icons-react';
import { useFormContext } from 'react-hook-form';

export const MessengerNotificationPreview = () => {
  const { watch } = useFormContext();

  const isMobile = watch('notification.isMobile');
  const title = watch('notification.title');
  const content = watch('notification.content');

  if (isMobile) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 p-10">
        <div className="w-full max-w-sm rounded-xl bg-white shadow-lg px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <IconBellRinging className="h-3 w-3" />
            Erxes
            <span className="ml-auto">now</span>
          </div>

          <div className="text-sm font-semibold mb-1">
            {title || 'Notification title'}
          </div>

          <div className="text-sm text-muted-foreground line-clamp-3">
            {content || 'Notification content will appear here'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-10 bg-muted/30">
      <div className="mx-auto max-w-md rounded-md bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <IconBellRinging className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">In-app notification</span>
        </div>

        <div className="px-4 py-4">
          <div className="mb-1 text-sm font-semibold">
            {title || 'Notification title'}
          </div>

          <div className="text-sm text-muted-foreground whitespace-pre-line">
            {content || 'Notification content will appear here'}
          </div>
        </div>
      </div>
    </div>
  );
};
