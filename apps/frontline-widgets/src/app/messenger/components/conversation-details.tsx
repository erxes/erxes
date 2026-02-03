import { useMemo, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { BotMessage, OperatorMessage, CustomerMessage } from './conversation';
import { ChatInput } from './chat-input';
import { useConversationDetail } from '../hooks/useConversationDetail';
import {
  connectionAtom,
  conversationIdAtom,
  messengerDataAtom,
} from '../states';
import { Skeleton, cn } from 'erxes-ui';
import { formatMessageDate, getDateKey } from '@libs/formatDate';
import { DateSeparator } from './date-separator';
import { BotSeparator } from './bot-separator';
import { TypingStatus } from './typing-status';
import { InitialMessage } from '../constants';

const defaultLogo = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAB0CAMAAAAl8kW/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACglBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAABxMqsfAAAA1HRSTlMAKRBgAZQKd1JAthrjKAXDiY7kDFT+WifxwNT7LKORaOg0+V8T4McCt/wzf5ZH7B7rBsjLkzgEWZ9PKvTvFSN2DddujVuq0hHnQnA9cSQ7pdzb8xtTBwO7c8SkhIdLRqhiIe74CM31jPAtm3zfYdpvL7EPtK73aXWCNko+4acZUCAcwrmK0PpRbSXZTqC+wTdmNR/2iOoxbNg6P4ESulcOj/0wxURjeM6cFLVdkC7yHZ5FfpcXyuZWaukJmpimr+0iGHmsQdUmekyzsoa/uFzdleIWoh4NTwYAAAABYktHRACIBR1IAAAACXBIWXMAAAsSAAALEgHS3X78AAAEk0lEQVRo3s3Z+UMUVRwA8Oc6bh60JjYVoSkbpaOI7KprHpikEhSiKGxFmG3YiomGW9BlmgWImrdU3hmVZ3afdtl92P39g3oX2wzL7rw38/2h9wsz7/jsLPN9875vh5D/eRmC7AWG4nrGsCAueNVwXG/ESFxvVN7VqF5o9DW4Fzgmfyyqd615Hap3/Q0FBqYXvLFwHOoFjoebUL0JMDGA6RWF4WZMr/gWuBXzjkyaDNYUzAucClCC6U2zoLQY0ZteBjAB0YtEAWZMQgRnApizcnWIhbS82QBwW+4uc3Qiau48gPnlufssuF3dW1hBL/AOt16LFiuDS6hXGXPrdWdVtaJ3F/XMu9371ZQtVfJqwxRcptAxsryuXKFbeT71VqxU+eh6iDa4dorfQz24V+m7GPdBo2vw3M+8CsWonWVCk0uXVSYDH1DzCFkN8GDODomHmLdE1SOJZgjnCp41DzMvOV0ZJGsBWtZlb36EebBe3SOBUoDWrMGzgXsb3UPBVh6lI6JZ0se2JAdX6XgkVEeHbIoP1pTayL3HtDxChrNBgwWP8Tj32hOaIBnNhnVk1j/BPXhS1yNPsdC1nh5Y/YzFvc0e0vNn2cCBwbOlSlzgVn2PPNfORuZts9fFnhfeCx48Qjr52C77l1srvG5v6XmgjI+2Bc92U4Buj45spUcMT2cuO1pEhef0PLRTAD3iNNglTsF7er5dANYufvai9Hb7SAb3CCK5lx7vk56v9Hy/vAs0eKY0S9Bfer5MKpWJVnlUlfIFHmiXzkH513d6fgicxXd6nup1eNZLPj1CXnaACOl57BWbh5Kez7GB+xA8QgrSHlJ6fjgNHkHxyNE0qJEu5yg7mtPg/GMY4HHbTVmE4J2wh2HzAd/eyXxHYI/3Db7qnMqnXvPptRUOeDh4W0DTxeiTjjnzlDx63Rf4Rv+FdZI35dFpP7OluFQqx+naXCKP1bdumeWMNFrP0pP4OXmilbk6ymG5RCXFUzVVKU5rvHqx/oX9vKzYliceil6XqRrpXUjXvCWy60PevJUXhVdg23/t4unmwbc9gavlGu/YXXTwune8eO/Kx8F+ZzWfipaHbKRBbB4y9nzxTaxWd09By3vCez+jIRhl9SN0vQUiBemLZDZ9wILnQ90EYiT3Pho1WNs6lsh+rOfVcy9cO3hrdRhgudZPUGPFlPgkWzvLPXt0wE63aGsC+PSkujuum6cJa7L3MBp1dnsG3y715pxfn0Vh3hZVcCifDC6RVl4HlxS9Y71KD72lpYWKr7Q+Z94X7v2qw18qeXvZ8talsh1ebNYq9Iqfpt5XXyt99vo+hU5sw2hNU/vnGI3ur8kus3n6jZpHSKTE9fdNtnP6Vv1JkvrOpUM19b5fqOzRWZ+7uaECoOUHDc+t/Eizop8QvQRddqcieuRngF8wX93QLdNOf5thZwluhotzMb9wE5j1mN6QbvgV0zOuwG9x/8x/5Xf4A2Xf1V8CE5NtmB75E2ajekXWGFQvPuMK6g0hHX+pvEFRL39XFaF65J8NuN6RYbhe6FLEP2Iv55WTHrVyuQ3XI7jX9y/JAcmAtCI0lQAAAABJRU5ErkJggg==)'

const MESSAGE_GROUP_TIME_WINDOW = 5 * 60 * 1000;

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
  const messengerConnectData = useAtomValue(messengerDataAtom);
  const connection = useAtomValue(connectionAtom);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { widgetsMessengerConnect } = connection || {};
  const { messengerData } = widgetsMessengerConnect || {};
  const { botGreetMessage, botShowInitialMessage, messages: messagesConfig } = messengerData || {};
  const { conversationDetail, loading, isBotTyping } = useConversationDetail({
    variables: {
      _id: conversationId,
      integrationId: messengerConnectData?.integrationId ?? '',
    },
    skip: !conversationId || !messengerConnectData?.integrationId,
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
      const lastGroup = groups[groups.length - 1];

      if (lastGroup) {
        const groupTime = new Date(lastGroup.firstMessage.createdAt).getTime();
        const timeDifference = Math.abs(messageTime - groupTime);
        const shouldGroup = shouldGroupMessages(
          message,
          lastGroup.firstMessage,
          timeDifference,
        );

        if (shouldGroup) {
          lastGroup.messages.push({ ...message, showAvatar: false });
        } else {
          groups.push({
            messages: [{ ...message, showAvatar: true }],
            firstMessage: message,
          });
        }
      } else {
        groups.push({
          messages: [{ ...message, showAvatar: true }],
          firstMessage: message,
        });
      }
    });

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
    <div className="flex flex-col max-h-full overflow-y-hidden relative">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth scroll-p-0 scroll-m-0 scroll-pt-16 flex flex-col-reverse p-4 space-y-2"
      >
        {isBotTyping && <TypingStatus />}

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
                  className={cn(
                    groupIndex !== 0 && 'pt-4 w-full',
                    'space-y-0.5',
                  )}
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
                            attachments={message.attachments}
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
                        attachments={message.attachments}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })}

        {botShowInitialMessage && <BotMessage content={botGreetMessage} />}
        <div className='flex justify-start gap-2'>
          <div className='w-8 h-8 rounded-full bg-contain bg-center bg-primary' style={{ backgroundImage: defaultLogo }} />
          <span className='h-auto font-medium flex flex-col justify-start items-start text-[13px] leading-relaxed text-foreground text-left gap-1 px-3 py-2 bg-background whitespace-break-spaces wrap-break-word break-all rounded-lg shadow-2xs'>
            {messagesConfig?.welcome || InitialMessage.WELCOME}
          </span>
        </div>
      </div>
      <div className="shrink-0">
        <ChatInput />
      </div>
    </div>
  );
};
