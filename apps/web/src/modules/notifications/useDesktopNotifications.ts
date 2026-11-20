import { paths } from '~/lib/paths';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useEffectEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { watchArrivals } from './arrivals';
import { useNotificationSettings } from './useNotifications';

export const desktopSupported = () => typeof window !== 'undefined' && 'Notification' in window;

/** One inbox item as a desktop popup. Clicking it runs `open` and closes it, until `signal` aborts. */
const popUp = (
  item: { id: string; title: string; body?: string | null },
  open: () => void,
  signal: AbortSignal,
) => {
  const popup = new Notification(item.title, {
    body: item.body ?? undefined,
    tag: item.id,
    icon: '/favicon.ico',
  });

  popup.addEventListener(
    'click',
    () => {
      open();
      popup.close();
    },
    { signal },
  );

  return popup;
};

/**
 * Desktop notifications (Settings › Notifications › Browser): new inbox items
 * pop up while erxes isn't the tab in front (`watchArrivals`); the tag is the
 * notification's id, so several open tabs show it once. Clicking opens it. Signing out or turning them off closes the open ones.
 */
export const useDesktopNotifications = () => {
  const navigate = useNavigate();
  const client = useQueryClient();
  const { settings } = useNotificationSettings();

  const enabled =
    Boolean(settings?.browser) && desktopSupported() && Notification.permission === 'granted';

  // The latest navigate, so moving between pages keeps the popups open.
  const open = useEffectEvent((link: string) => {
    window.focus();
    void navigate(link);
  });

  useEffect(() => {
    if (!enabled) return;

    const popups = new Set<Notification>();
    const clicks = new AbortController();

    const unsubscribe = watchArrivals(client, (item) => {
      if (document.visibilityState === 'visible') return;

      popups.add(popUp(item, () => open(item.link ?? paths.notifications), clicks.signal));
    });

    return () => {
      unsubscribe();
      clicks.abort();

      for (const popup of popups) popup.close();
    };
  }, [client, enabled]);
};
