import { selectedNotificationIdsState } from '@/notification/states/notificationState';
import { MyInboxHotkeyScope } from '@/notification/types/notifications';
import type {
  UseNotificationNavigationOptions,
  UseNotificationNavigationResult,
} from '@/notification/types/myInbox';
import { useScopedHotkeys } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { TNotification } from 'ui-modules';
import { useNotificationList } from './useNotificationList';
import { shouldIgnoreNotificationHotkey } from '@/notification/utils/notificationHotkeys';

export const useNotificationNavigation = ({
  id,
  notification,
  handleMarkAsRead,
}: UseNotificationNavigationOptions): UseNotificationNavigationResult => {
  const { search, key: locationKey } = useLocation();
  const navigate = useNavigate();
  const { notifications } = useNotificationList();
  const selectedNotificationIds = useAtomValue(selectedNotificationIdsState);
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

  const visibleNotifications = notifications;
  const currentIndex = visibleNotifications.findIndex(
    (item) => item._id === id,
  );
  const adjacentRef = useRef<{
    id: string | undefined;
    search: string;
    previousId?: string;
    nextId?: string;
  }>({ id, search });
  const adjacent = adjacentRef.current;
  const sameList = adjacent.id === id && adjacent.search === search;
  const previousNotification =
    currentIndex >= 0
      ? visibleNotifications[currentIndex - 1]
      : visibleNotifications.find(
          (item) => sameList && item._id === adjacent.previousId,
        );
  const nextNotification =
    currentIndex >= 0
      ? visibleNotifications[currentIndex + 1]
      : sameList && (adjacent.nextId || adjacent.previousId)
      ? visibleNotifications.find((item) => item._id === adjacent.nextId)
      : visibleNotifications[0];

  // Opening an unread item removes it from this list after it is marked seen.
  useLayoutEffect(() => {
    if (currentIndex >= 0 || !sameList) {
      adjacentRef.current = {
        id,
        search,
        previousId: visibleNotifications[currentIndex - 1]?._id,
        nextId: visibleNotifications[currentIndex + 1]?._id,
      };
    }
  }, [id, search, currentIndex, sameList, visibleNotifications]);

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
        previousNotification ||
        (currentIndex === -1 ? visibleNotifications.at(-1) : undefined);
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
