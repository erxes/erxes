import { useRef, useState } from 'react';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useMarkAsReadNotification } from '@/notification/hooks/useMarkAsReadNotification';

export const useNotificationQuickRead = (
  id: string,
): { pending: boolean; markRead: () => Promise<void> } => {
  const markAsRead = useMarkAsReadNotification();
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const { toast } = useToast();
  const { t } = useTranslation('common', { keyPrefix: 'notification' });

  const markRead = async (): Promise<void> => {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    try {
      if (await markAsRead(id)) {
        toast({ title: t('marked-as-read', { count: 1 }) });
      }
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  };

  return { pending, markRead };
};
