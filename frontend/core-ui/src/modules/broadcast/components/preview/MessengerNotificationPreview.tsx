import { useFormContext } from 'react-hook-form';
import { BroadcastMobileNotificationMockup } from '../mockup/BroadcastMobileNotificationMockup';
import { BroadcastWebNotificationMockup } from '../mockup/BroadcastWebNotificationMockup';

export const MessengerNotificationPreview = () => {
  const { watch } = useFormContext();

  const isMobile = watch('notification.isMobile');

  if (isMobile) {
    return <BroadcastMobileNotificationMockup />;
  }

  return <BroadcastWebNotificationMockup />;
};
