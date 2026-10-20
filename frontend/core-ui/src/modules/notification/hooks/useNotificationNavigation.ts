import {
  hiddenNotificationIdsState,
  selectedNotificationIdsState,
} from '@/notification/states/notificationState';
import { MyInboxHotkeyScope } from '@/notification/types/notifications';
import type {
  UseNotificationNavigationOptions,
  UseNotificationNavigationResult,
} from '@/notification/types/myInbox';
import { useScopedHotkeys } from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { TNotification } from 'ui-modules';
import { useNotifications } from './useNotifications';
import { shouldIgnoreNotificationHotkey } from '@/notification/utils/notificationHotkeys';

export const useNotificationNavigation = ({
  id,
  notification,
  handleMarkAsRead,
}: UseNotificationNavigationOptions): UseNotificationNavigationResult => {
  const { search, key: locationKey } = useLocation();
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const selectedNotificationIds = useAtomValue(selectedNotificationIdsState);
  const [hiddenNotificationIds, setHiddenNotificationIds] = useAtom(
    hiddenNotificationIdsState,
  );
  const [dismissing, setDismissing] = useState(false);
  const dismissScopeRef = useRef({ active: false });

  useLayoutEffect(() => {
    const scope = { active: true };
    dismissScopeRef.current = scope;
    setDismissing(false);
    return () => {
      scope.active = false;
    };
  }, [locationKey]);

  const visibleNotifications = notifications.filter(
    (notification) => !hiddenNotificationIds.includes(notification._id),
  );
  const currentIndex = visibleNotifications.findIndex(
    (item) => item._id === id,
  );
  const previousNotification = visibleNotifications[currentIndex - 1];
  const nextNotification = visibleNotifications[currentIndex + 1];

  const navigateToNotification = (item: TNotification): void => {
    if (!dismissing) navigate(`/my-inbox/${item._id}${search}`);
  };

  const dismissNotification = async (): Promise<void> => {
    const scope = dismissScopeRef.current;
    if (!notification || dismissing || !scope.active) return;
    setDismissing(true);
    try {
      if (!notification.isRead) {
        const success = await handleMarkAsRead(notification._id);
        if (!success) return;
      }
      if (!scope.active) return;
      setHiddenNotificationIds((previous) => [...previous, notification._id]);
      const adjacent = nextNotification || previousNotification;
      navigate(
        adjacent ? `/my-inbox/${adjacent._id}${search}` : `/my-inbox${search}`,
      );
    } finally {
      if (scope.active) setDismissing(false);
    }
  };

  const hotkeyOptions = {
    enableOnContentEditable: false,
    ignoreEventWhen: shouldIgnoreNotificationHotkey,
  };
  useScopedHotkeys(
    'down,j',
    () => {
      if (nextNotification) navigateToNotification(nextNotification);
    },
    MyInboxHotkeyScope.MainPage,
    [nextNotification, search, navigate, dismissing],
    hotkeyOptions,
  );
  useScopedHotkeys(
    'up,k',
    () => {
      const target =
        currentIndex === -1
          ? visibleNotifications.at(-1)
          : previousNotification;
      if (target) navigateToNotification(target);
    },
    MyInboxHotkeyScope.MainPage,
    [
      dismissing,
      currentIndex,
      visibleNotifications,
      previousNotification,
      search,
      navigate,
    ],
    hotkeyOptions,
  );
  useScopedHotkeys(
    'ctrl+backspace,meta+backspace,ctrl+delete,meta+delete',
    () => {
      void dismissNotification();
    },
    MyInboxHotkeyScope.MainPage,
    [
      notification,
      dismissing,
      nextNotification,
      previousNotification,
      search,
      navigate,
      handleMarkAsRead,
      selectedNotificationIds.length,
    ],
    {
      ...hotkeyOptions,
      ignoreEventWhen: (event) =>
        selectedNotificationIds.length > 0 ||
        shouldIgnoreNotificationHotkey(event),
    },
  );

  return {
    previousNotification,
    nextNotification,
    navigateToNotification,
    dismissNotification,
    dismissing,
  };
};
