import { useMarkAsReadNotification } from '@/notification/hooks/useMarkAsReadNotification';
import { useDeleteNotifications } from '@/notification/hooks/useDeleteNotifications';
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
import { useConfirm, useScopedHotkeys, useToast } from 'erxes-ui';
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
  const deleteNotifications = useDeleteNotifications();
  const setHiddenIds = useSetAtom(hiddenNotificationIdsState);
  const setSelectedIds = useSetAtom(selectedNotificationIdsState);
  const batchScopeRef = useRef({ active: false });
  const [pending, setPending] = useState(false);
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const selectedNotifications = notifications.filter((notification) =>
    selectedIds.includes(notification._id),
  );
  const allRead =
    selectedNotifications.length > 0 &&
    selectedNotifications.every((notification) => notification.isRead);

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
      if (!loading && !pending) {
        extend(event.key === 'ArrowDown' ? 1 : -1);
      }
    },
    MyInboxHotkeyScope.MainPage,
    [extend, loading, pending],
    {
      enableOnContentEditable: false,
      ignoreEventWhen: shouldIgnoreNotificationHotkey,
    },
  );

  useScopedHotkeys(
    'esc',
    () => {
      if (!pending) clear();
    },
    MyInboxHotkeyScope.MainPage,
    [clear, pending],
    {
      enableOnContentEditable: false,
      ignoreEventWhen: shouldIgnoreNotificationHotkey,
    },
  );

  const markSelectedAsRead = async (): Promise<void> => {
    if (pending || allRead) return;
    const scope = batchScopeRef.current;
    setPending(true);
    try {
      const results = await Promise.all(
        selectedNotifications.map(async (notification) => ({
          id: notification._id,
          success: notification.isRead || (await markAsRead(notification._id)),
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
      setPending(false);
    }
  };

  const deleteSelected = async (): Promise<void> => {
    if (pending || !allRead) return;
    const scope = batchScopeRef.current;
    const ids = selectedNotifications.map((notification) => notification._id);
    await confirm({
      message: t('confirm-delete-selected', { count: ids.length }),
      options: {
        description: t('delete-permanently-description'),
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
        variants: { ok: 'destructive' },
      },
    });
    if (!scope.active) return;
    setPending(true);
    try {
      if (!(await deleteNotifications(ids))) return;
      setHiddenIds((previous) => [...new Set([...previous, ...ids])]);
      setSelectedIds((previous) =>
        previous.filter((selectedId) => !ids.includes(selectedId)),
      );
      if (scope.active && id && ids.includes(id))
        navigate(`/my-inbox${search}`);
    } finally {
      setPending(false);
    }
  };

  useScopedHotkeys(
    'ctrl+backspace,meta+backspace,ctrl+delete,meta+delete',
    () => {
      void (allRead ? deleteSelected() : markSelectedAsRead());
    },
    MyInboxHotkeyScope.MainPage,
    [
      selectedIds,
      notifications,
      pending,
      allRead,
      deleteSelected,
      markSelectedAsRead,
    ],
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
    pending,
    allRead,
    markSelectedAsRead,
    deleteSelected,
    onOpen: (notificationId, event) => {
      if (event.shiftKey || event.metaKey || event.ctrlKey) {
        event.preventDefault();
        if (!pending) select(notificationId, event.shiftKey);
      } else {
        clear();
        setAnchor(notificationId);
      }
    },
  };
};
