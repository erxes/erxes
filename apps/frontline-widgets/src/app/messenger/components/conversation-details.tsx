import { useMemo, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { BotMessage, OperatorMessage, CustomerMessage } from './conversation';
import { ChatInput } from './chat-input';
import { useConversationDetail } from '../hooks/useConversationDetail';
import {
  connectionAtom,
  conversationIdAtom,
  integrationIdAtom,
} from '../states';
import { Skeleton, cn } from 'erxes-ui';
import { formatMessageDate, getDateKey } from '@libs/formatDate';
import { DateSeparator } from './date-separator';
import { BotSeparator } from './bot-separator';
import { TypingStatus } from './typing-status';

const MESSAGE_GROUP_TIME_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds

type Message = NonNullable<
  ReturnType<typeof useConversationDetail>['conversationDetail']
>['messages'][number];

type MessageWithAvatar = Message & { showAvatar: boolean };

type MessageGroup = {
  messages: MessageWithAvatar[];
  firstMessage: Message;
};

function isOperatorMessage(message: Message): boolean {
  return !message.customerId && !message.fromBot;
}

function isBotMessage(message: Message): boolean {
  return Boolean(message.fromBot);
}

function shouldGroupMessages(
  message: Message,
  groupFirstMessage: Message,
  timeDifference: number,
): boolean {
  if (timeDifference > MESSAGE_GROUP_TIME_WINDOW) return false;

  const messageIsOperator = isOperatorMessage(message);
  const groupIsOperator = isOperatorMessage(groupFirstMessage);

  if (messageIsOperator && groupIsOperator) {
    return message.userId === groupFirstMessage.userId;
  }

  if (!messageIsOperator && !groupIsOperator) {
    return message.customerId === groupFirstMessage.customerId;
  }

  return false;
}

export const ConversationDetails = () => {
  const conversationId = useAtomValue(conversationIdAtom);
  const integrationId = useAtomValue(integrationIdAtom);
  const connection = useAtomValue(connectionAtom);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { widgetsMessengerConnect } = connection || {};
  const { messengerData } = widgetsMessengerConnect || {};
  const { botGreetMessage, botShowInitialMessage } = messengerData || {};
  const { conversationDetail, loading, isBotTyping } = useConversationDetail({
    variables: {
      _id: conversationId,
      integrationId,
    },
    skip: !conversationId || !integrationId,
  });
  const { messages } = conversationDetail || {};

  const messagesByDate = useMemo(() => {
    if (!messages) return {};

    const grouped: Record<string, typeof messages> = {};

    messages.forEach((message) => {
      const dateKey = getDateKey(message.createdAt);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(message);
    });

    Object.keys(grouped).forEach((dateKey) => {
      grouped[dateKey].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    });

    return grouped;
  }, [messages]);

  const groupMessagesByTimeAndUser = (
    messagesForDate: Message[] | undefined,
  ): MessageGroup[] => {
    if (!messagesForDate) return [];

    const groups: MessageGroup[] = [];

    messagesForDate.forEach((message) => {
      const messageTime = new Date(message.createdAt).getTime();

      const existingGroup = groups.find((group) => {
        const groupTime = new Date(group.firstMessage.createdAt).getTime();
        const timeDifference = Math.abs(messageTime - groupTime);

        return shouldGroupMessages(message, group.firstMessage, timeDifference);
      });

      if (existingGroup) {
        existingGroup.messages.push({ ...message, showAvatar: false });
      } else {
        groups.push({
          messages: [{ ...message, showAvatar: true }],
          firstMessage: message,
        });
      }
    });

    // Set avatar visibility: only show on the last message of each group
    groups.forEach((group) => {
      group.messages.forEach((message, index) => {
        message.showAvatar = index === group.messages.length - 1;
      });
    });

    return groups;
  };

  const sortedDateKeys = useMemo(() => {
    return Object.keys(messagesByDate).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    );
  }, [messagesByDate]);

  if (loading) {
    return <Skeleton className="w-full aspect-square" />;
  }

  return (
    <div className="flex flex-col max-h-full overflow-y-hidden">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth scroll-p-0 scroll-m-0 scroll-pt-16 flex flex-col-reverse p-4 space-y-2"
      >
        {botShowInitialMessage && <BotMessage content={botGreetMessage} />}

        {sortedDateKeys.map((dateKey, index) => {
          const messagesForDate = messagesByDate[dateKey];
          const dateLabel = formatMessageDate(dateKey);
          const messageGroups = groupMessagesByTimeAndUser(messagesForDate);
          const isLastDate = index === sortedDateKeys.length - 1;

          return (
            <div
              key={dateKey}
              className={cn(
                isLastDate && 'snap-end',
                'space-y-2 transition-all duration-300',
              )}
            >
              <DateSeparator date={dateLabel} />
              {messageGroups.map((group, groupIndex) => (
                <div
                  key={`group-${groupIndex}`}
                  className={cn(groupIndex !== 0 && 'pt-4', 'space-y-0.5')}
                >
                  {group.messages.map((message, messageIndex) => {
                    const messagePositionProps = {
                      isFirstMessage: messageIndex === 0,
                      isLastMessage: messageIndex === group.messages.length - 1,
                      isMiddleMessage:
                        messageIndex !== 0 &&
                        messageIndex !== group.messages.length - 1,
                      isSingleMessage: group.messages.length === 1,
                    };

                    if (isBotMessage(message)) {
                      return (
                        <BotSeparator
                          key={message._id}
                          content={message.content}
                        />
                      );
                    }

                    if (isOperatorMessage(message)) {
                      return (
                        <div key={message._id}>
                          <OperatorMessage
                            content={message.content}
                            src={
                              message.user?.details?.avatar ||
                              'assets/user.webp'
                            }
                            createdAt={new Date(message.createdAt)}
                            showAvatar={message.showAvatar}
                            {...messagePositionProps}
                          />
                        </div>
                      );
                    }

                    return (
                      <CustomerMessage
                        key={message._id}
                        content={message.content}
                        createdAt={new Date(message.createdAt)}
                      />
                    );
                  })}
                </div>
              ))}
              {isBotTyping && <TypingStatus />}
            </div>
          );
        })}
      </div>
      <div className="flex-shrink-0">
        <ChatInput />
      </div>
    </div>
  );
};
