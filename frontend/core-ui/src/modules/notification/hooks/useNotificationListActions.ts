import { useMarkAsReadNotification } from '@/notification/hooks/useMarkAsReadNotification';
import { useNotificationSelection } from '@/notification/hooks/useNotificationSelection';
import {
  hiddenNotificationIdsState,
  selectedNotificationIdsState,
} from '@/notification/states/notificationState';
import type {
  UseNotificationListActionsResult,
  UseNotificationListResult,
} from '@/notification/types/myInbox';
import { MyInboxHotkeyScope } from '@/notification/types/notifications';
import { shouldIgnoreNotificationHotkey } from '@/notification/utils/notificationHotkeys';
import { useScopedHotkeys, useToast } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export const useNotificationListActions = ({
  notifications,
  loading,
}: Pick<
  UseNotificationListResult,
  'notifications' | 'loading'
>): UseNotificationListActionsResult => {
  const { search, key: locationKey } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedIds, focusedId, select, extend, setAnchor, clear } =
    useNotificationSelection(
      notifications.map((notification) => notification._id),
      search,
      id,
    );
  const markAsRead = useMarkAsReadNotification();
  const setHiddenIds = useSetAtom(hiddenNotificationIdsState);
  const setSelectedIds = useSetAtom(selectedNotificationIdsState);
  const batchScopeRef = useRef({ active: false });
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation('common', { keyPrefix: 'notification' });

  useLayoutEffect(() => {
    const scope = { active: true };
    batchScopeRef.current = scope;
    return () => {
      scope.active = false;
    };
  }, [locationKey]);

  useScopedHotkeys(
    'shift+down,shift+up',
    (event) => {
      if (!loading && !markingAsRead) {
        extend(event.key === 'ArrowDown' ? 1 : -1);
      }
    },
    MyInboxHotkeyScope.MainPage,
    [extend, loading, markingAsRead],
    {
      enableOnContentEditable: false,
      ignoreEventWhen: shouldIgnoreNotificationHotkey,
    },
  );

  useScopedHotkeys(
    'esc',
    () => {
      if (!markingAsRead) clear();
    },
    MyInboxHotkeyScope.MainPage,
    [clear, markingAsRead],
    {
      enableOnContentEditable: false,
      ignoreEventWhen: shouldIgnoreNotificationHotkey,
    },
  );

  const markSelectedAsRead = async (): Promise<void> => {
    if (markingAsRead) return;
    const scope = batchScopeRef.current;
    setMarkingAsRead(true);
    try {
      const selectedNotifications = notifications.filter((notification) =>
        selectedIds.includes(notification._id),
      );
      const results = await Promise.all(
        selectedNotifications.map(async (notification) => ({
          id: notification._id,
          success:
            notification.isRead || (await markAsRead(notification._id)),
        })),
      );
      const completedIds = results
        .filter((result) => result.success)
        .map((result) => result.id);
      if (completedIds.length > 0) {
        setHiddenIds((previous) => [
          ...new Set([...previous, ...completedIds]),
        ]);
        setSelectedIds((previous) =>
          previous.filter((selectedId) => !completedIds.includes(selectedId)),
        );
        if (scope.active && id && completedIds.includes(id)) {
          navigate(`/my-inbox${search}`);
        }
        toast({
          title: t('marked-as-read', {
            defaultValue: '{{count}} notifications marked as read',
            count: completedIds.length,
          }),
        });
      }
    } finally {
      setMarkingAsRead(false);
    }
  };

  useScopedHotkeys(
    'ctrl+backspace,meta+backspace,ctrl+delete,meta+delete',
    () => {
      void markSelectedAsRead();
    },
    MyInboxHotkeyScope.MainPage,
    [selectedIds, notifications, markingAsRead, markSelectedAsRead],
    {
      enableOnContentEditable: false,
      ignoreEventWhen: (event) =>
        selectedIds.length === 0 || shouldIgnoreNotificationHotkey(event),
    },
  );

  return {
    selectedIds,
    focusedId,
    clear,
    markingAsRead,
    markSelectedAsRead,
    onOpen: (notificationId, event) => {
      if (event.shiftKey || event.metaKey || event.ctrlKey) {
        event.preventDefault();
        if (!markingAsRead) select(notificationId, event.shiftKey);
      } else {
        clear();
        setAnchor(notificationId);
      }
    },
  };
};
