import { Avatar, Button } from 'erxes-ui';
import { IconBellOff, IconCheck, IconChecks, IconVolume } from '@tabler/icons-react';
import { useMutation } from '@apollo/client';
import { useAtomValue, useSetAtom } from 'jotai';
import { notificationsAtom, setConversationIdAtom } from '../states';
import { useMessenger } from '../hooks/useMessenger';
import { MARK_NOTIFICATIONS_READ } from '../graphql/notificationOperations';
import { formatMessageDate } from '@libs/formatDate';
import { useNotificationSound } from '@libs/useNotificationSound';

export const NotificationsPanel = () => {
  const notifications = useAtomValue(notificationsAtom);
  const { switchToTab } = useMessenger();
  const setConversationId = useSetAtom(setConversationIdAtom);
  const { play: playSound } = useNotificationSound();

  const [markRead, { loading: markingRead }] = useMutation(MARK_NOTIFICATIONS_READ);
  const markConversationRead = (conversationId: string) =>
    markRead({ variables: { conversationId } });

  const handleNotificationClick = (conversationId: string) => {
    markConversationRead(conversationId);
    setConversationId(conversationId);
    switchToTab('chat');
  };

  const handleMarkAllRead = () => {
    const unread = notifications.filter((n) => !n.isRead);
    const convIds = [...new Set(unread.map((n) => n.conversationId))];
    convIds.forEach((id) => markConversationRead(id));
  };

  if (!notifications.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground p-6">
        <IconBellOff className="size-10 opacity-40" />
        <p className="text-sm font-medium">No notifications yet</p>
        <p className="text-xs text-center">
          You'll see messages from the support team here.
        </p>
      </div>
    );
  }

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center px-3 pt-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground gap-1.5"
          onClick={playSound}
          title="Test notification sound"
        >
          <IconVolume className="size-3.5" />
          Test sound
        </Button>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground gap-1.5"
            onClick={handleMarkAllRead}
            disabled={markingRead}
          >
            <IconChecks className="size-3.5" />
            Mark all as read
          </Button>
        )}
      </div>

      <ul className="flex flex-col gap-1 p-3 overflow-y-auto styled-scroll flex-1 min-h-0">
        {notifications.map((item) => (
          <li key={item.message._id}>
            <button
              type="button"
              onClick={() => handleNotificationClick(item.conversationId)}
              className={[
                'w-full text-left flex items-start gap-3 rounded-lg p-3 transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                item.isRead
                  ? 'opacity-50 hover:opacity-70 hover:bg-accent/30'
                  : 'bg-primary/8 border border-primary/20 hover:bg-primary/12 shadow-sm',
              ].join(' ')}
            >
              <div className="relative shrink-0 mt-0.5">
                <Avatar size="xl" className={item.isRead ? 'grayscale' : ''}>
                  {item.agentAvatar && (
                    <Avatar.Image src={item.agentAvatar} alt={item.agentName} />
                  )}
                  <Avatar.Fallback>
                    {(item.agentName ?? 'S').charAt(0).toUpperCase()}
                  </Avatar.Fallback>
                </Avatar>
                {!item.isRead && (
                  <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary border-2 border-background" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className={['text-xs truncate', item.isRead ? 'font-medium' : 'font-bold text-foreground'].join(' ')}>
                    {item.agentName}
                  </span>
                  <span className={['text-[10px] shrink-0', item.isRead ? 'text-muted-foreground' : 'text-primary font-semibold'].join(' ')}>
                    {formatMessageDate(item.message.createdAt)}
                  </span>
                </div>
                <p className={['text-xs line-clamp-2 leading-relaxed', item.isRead ? 'text-muted-foreground/70' : 'text-foreground/80'].join(' ')}>
                  {item.message.content}
                </p>
              </div>

              {item.isRead && (
                <IconCheck className="size-3.5 text-muted-foreground/50 shrink-0 mt-1" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
