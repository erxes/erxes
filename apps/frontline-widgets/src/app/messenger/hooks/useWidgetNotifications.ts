import { useMutation, useQuery } from '@apollo/client';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import {
  connectionAtom,
  integrationIdAtom,
  notificationsAtom,
  unreadNotificationCountAtom,
} from '../states';
import { useNotificationSound } from '@libs/useNotificationSound';
import { useWebNotification } from '@libs/useWebNotification';
import {
  GET_WIDGET_NOTIFICATIONS,
  MARK_NOTIFICATIONS_READ,
  NOTIFICATION_CONVERSATION_CHANGED,
} from '../graphql/notificationOperations';
import { getLocalStorageItem } from '@libs/utils';
import { IConversationMessage, IMessage } from '../types';

interface IQueryResponse {
  widgetsConversations: IConversationMessage[];
}

export interface INotificationItem {
  conversationId: string;
  message: IMessage;
  isRead: boolean;
  agentName?: string;
  agentAvatar?: string;
}

export const useWidgetNotifications = () => {
  const integrationId = useAtomValue(integrationIdAtom);
  const connection = useAtomValue(connectionAtom);
  const setUnreadCount = useSetAtom(unreadNotificationCountAtom);
  const setNotifications = useSetAtom(notificationsAtom);
  const { play: playNotificationSound } = useNotificationSound();
  const { notify: webNotify } = useWebNotification();

  const cachedCustomerId = getLocalStorageItem('customerId');
  const { customerId, visitorId } = connection.widgetsMessengerConnect || {};

  const { data, loading, error, subscribeToMore, refetch } =
    useQuery<IQueryResponse>(GET_WIDGET_NOTIFICATIONS, {
      variables: {
        integrationId,
        customerId: customerId || cachedCustomerId || undefined,
        visitorId: visitorId || undefined,
      },
      fetchPolicy: 'network-only',
      skip: !integrationId,
    });

  const notifications: INotificationItem[] = useMemo(() => {
    if (!data?.widgetsConversations) return [];

    const items: INotificationItem[] = [];
    const effectiveCustomerId = customerId || cachedCustomerId;

    data.widgetsConversations.forEach((conv) => {
      conv.messages.forEach((msg) => {
        if (msg.customerId === effectiveCustomerId) return;
        if (!msg.userId) return; // skip bot/system messages — they are never marked read

        items.push({
          conversationId: conv._id,
          message: msg,
          isRead: msg.isCustomerRead ?? false,
          agentName:
            msg.user?.details?.fullName ||
            msg.user?.details?.shortName ||
            'Support',
          agentAvatar: msg.user?.details?.avatar,
        });
      });
    });

    return items.sort(
      (a, b) =>
        new Date(b.message.createdAt).getTime() -
        new Date(a.message.createdAt).getTime(),
    );
  }, [data, customerId, cachedCustomerId]);

  const unreadCount = useMemo(
    () =>
      new Set(
        notifications.filter((n) => !n.isRead).map((n) => n.conversationId),
      ).size,
    [notifications],
  );

  useEffect(() => {
    setUnreadCount(unreadCount);
  }, [unreadCount, setUnreadCount]);

  useEffect(() => {
    setNotifications(notifications);
  }, [notifications, setNotifications]);

  useEffect(() => {
    if (!data?.widgetsConversations || !subscribeToMore) return;

    const unsubscribes = data.widgetsConversations.map((conv) =>
      subscribeToMore({
        document: NOTIFICATION_CONVERSATION_CHANGED,
        variables: { _id: conv._id },
        updateQuery: (prev, { subscriptionData }: any) => {
          if (!prev || !subscriptionData.data) return prev;

          const newMessage = subscriptionData.data.conversationMessageInserted;
          if (!newMessage) return prev;

          const convIndex = prev.widgetsConversations.findIndex(
            (c) => c._id === conv._id,
          );
          // Conversation not in cache yet (created after last query) — refetch to
          // pick it up and set up a subscription for it.
          if (convIndex === -1) {
            refetch();
            return prev;
          }

          const existing = prev.widgetsConversations[convIndex];
          if (existing.messages.some((m) => m._id === newMessage._id))
            return prev;

          // Play sound only for agent messages (not the customer's own messages)
          const effectiveCustomerId =
            connection.widgetsMessengerConnect?.customerId ||
            getLocalStorageItem('customerId');
          if (
            !newMessage.customerId ||
            newMessage.customerId !== effectiveCustomerId
          ) {
            playNotificationSound();
            const senderName =
              newMessage.user?.details?.fullName ||
              newMessage.user?.details?.shortName ||
              'Support';
            webNotify(senderName, { body: newMessage.content });
          }

          const updated = [...prev.widgetsConversations];
          updated[convIndex] = {
            ...existing,
            messages: [...existing.messages, newMessage],
          };

          return { widgetsConversations: updated };
        },
      }),
    );

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [
    data?.widgetsConversations,
    subscribeToMore,
    refetch,
    connection.widgetsMessengerConnect?.customerId,
    playNotificationSound,
    webNotify,
  ]);

  const [markRead, { loading: markingRead }] = useMutation(
    MARK_NOTIFICATIONS_READ,
  );

  const markConversationRead = (conversationId: string) =>
    markRead({
      variables: { conversationId },
      onCompleted: () => refetch(),
    });

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markConversationRead,
    markingRead,
  };
};
