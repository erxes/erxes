import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { orpc } from '~/lib/api';
import { useNotificationSettings } from './useNotifications';

export const desktopSupported = () => typeof window !== 'undefined' && 'Notification' in window;

/**
 * Desktop notifications (Settings › Notifications › Browser): new inbox items
 * pop up while erxes isn't the tab in front. The list refetches on the live
 * inbox signal; the tag is the notification's id, so several open tabs show
 * it once. Clicking opens it.
 */
export const useDesktopNotifications = () => {
  const navigate = useNavigate();
  const { settings } = useNotificationSettings();

  const enabled =
    Boolean(settings?.browser) && desktopSupported() && Notification.permission === 'granted';

  const seen = useRef<Set<string> | null>(null);

  // A failed check stays quiet: the next live signal or poll tries again.
  const latest = useQuery(
    orpc.notifications.list.queryOptions({
      input: { limit: 5, unread: 'true', direction: 'forward', cursorMode: 'exclusive' },
      enabled,
    }),
  );

  useEffect(() => {
    const items = latest.data?.data ?? [];

    // What was there when the app opened isn't news.
    if (!seen.current) {
      if (latest.data) seen.current = new Set(items.map((item) => item.id));

      return;
    }

    for (const item of items) {
      if (seen.current.has(item.id)) continue;
      seen.current.add(item.id);

      if (!enabled || document.visibilityState === 'visible') continue;

      const popup = new Notification(item.title, {
        body: item.body ?? undefined,
        tag: item.id,
        icon: '/favicon.ico',
      });

      popup.onclick = () => {
        window.focus();
        navigate(item.link ?? '/notifications');
        popup.close();
      };
    }
  }, [latest.data, enabled, navigate]);
};
