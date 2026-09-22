import { useFormContext } from 'react-hook-form';
import { BroadcastMobileNotificationMockup } from '../mockup/BroadcastMobileNotificationMockup';
import { BroadcastWebNotificationMockup } from '../mockup/BroadcastWebNotificationMockup';

export const MessengerNotificationPreview = () => {
  const { watch } = useFormContext();

  const isMobile = watch('notification.isMobile');
  const inApp = watch('notification.inApp');

  if (isMobile) {
    return <BroadcastMobileNotificationMockup />;
  }

  if (inApp !== false) {
    return <BroadcastWebNotificationMockup />;
  }

  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Select at least one notification channel to preview
    </div>
  );
};
