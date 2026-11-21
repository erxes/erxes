import type { Notification as InboxItem } from '@erxes/core-contract';
import { liveOptions } from '~/lib/live';
import { paths } from '~/lib/paths';
import { QueryObserver, useQueryClient } from '@tanstack/react-query';
import { useEffect, useEffectEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { orpc } from '@erxes/core-contract/client';
import { useTranslation } from 'react-i18next';
import { pluginTranslationsReady } from '~/modules/plugins/pluginText';
import { useNotificationText } from './notificationText';
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
 * pop up while erxes isn't the tab in front. The list refetches on the live
 * inbox signal; the tag is the notification's id, so several open tabs show
 * it once. Clicking opens it. Signing out or turning them off closes the open ones.
 */
export const useDesktopNotifications = () => {
  const navigate = useNavigate();
  const client = useQueryClient();
  const { settings } = useNotificationSettings();

  const enabled =
    Boolean(settings?.browser) && desktopSupported() && Notification.permission === 'granted';

  const { i18n } = useTranslation();
  const text = useNotificationText();
  // The member's language now, not the one in use when the popups were turned on.
  const shown = useEffectEvent(text);

  // The latest navigate, so moving between pages keeps the popups open.
  const open = useEffectEvent((link: string) => {
    window.focus();
    void navigate(link);
  });

  useEffect(() => {
    if (!enabled) return;

    // A failed check stays quiet: the next live signal or poll tries again.
    const latest = new QueryObserver(
      client,
      orpc.notifications.list.queryOptions({
        input: { limit: 5, unread: 'true', direction: 'forward', cursorMode: 'exclusive' },
        ...liveOptions(['inbox']),
      }),
    );

    const popups = new Set<Notification>();
    const clicks = new AbortController();
    let seen: Set<string> | undefined;

    const tell = async (item: InboxItem, fromPlugin: boolean) => {
      if (fromPlugin) await pluginTranslationsReady(client, i18n);

      if (clicks.signal.aborted) return;

      popups.add(
        popUp(
          { id: item.id, ...shown(item) },
          () => open(item.link ?? paths.notifications),
          clicks.signal,
        ),
      );
    };

    const unsubscribe = latest.subscribe(({ data }) => {
      if (!data) return;

      // What was there when they were turned on isn't news.
      if (!seen) {
        seen = new Set(data.data.map((item) => item.id));

        return;
      }

      for (const item of data.data) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);

        if (document.visibilityState === 'visible') continue;

        // A popup's words can't change once shown, so a plugin's wait for its translations.
        void tell(item, item.source !== 'core');
      }
    });

    return () => {
      unsubscribe();
      clicks.abort();

      for (const popup of popups) popup.close();
    };
  }, [client, enabled, i18n]);
};
