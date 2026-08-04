import { useCallback, useEffect } from 'react';

const isSupported = () =>
  typeof window !== 'undefined' && 'Notification' in window;

export const useWebNotification = () => {
  useEffect(() => {
    if (isSupported() && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const notify = useCallback(
    (
      title: string,
      options?: { body?: string; icon?: string; onClick?: () => void },
    ) => {
      if (!isSupported() || Notification.permission !== 'granted') return;

      const n = new Notification(title, {
        body: options?.body,
        icon: options?.icon ?? '/favicon.ico',
        tag: 'erxes-widget-message',
      });

      n.onclick = () => {
        window.focus();
        n.close();
        options?.onClick?.();
      };

      setTimeout(() => n.close(), 5000);
    },
    [],
  );

  const requestPermission = useCallback(async () => {
    if (!isSupported()) return 'denied' as NotificationPermission;
    return Notification.requestPermission();
  }, []);

  return {
    notify,
    requestPermission,
    permission: isSupported() ? Notification.permission : 'denied',
  };
};
