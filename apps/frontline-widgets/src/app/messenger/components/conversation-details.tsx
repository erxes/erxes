import { AnimatePresence } from 'motion/react';
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  BotMessage,
  OperatorMessage,
  CustomerMessage,
  WelcomeMessage,
} from './conversation';
import { useConversationDetail } from '../hooks/useConversationDetail';
import {
  connectionAtom,
  conversationIdAtom,
  isBotTypingAtom,
  messengerDataAtom,
  operatorStatusAtom,
  setConversationIdAtom,
} from '../states';
import { useChangeOperatorStatus } from '../hooks/useChangeOperatorStatus';
import { Avatar, Button, readImage, Skeleton, cn } from 'erxes-ui';
import { formatMessageDate, getDateKey } from '@libs/formatDate';
import { DateSeparator } from './date-separator';
import { TypingStatus } from './typing-status';
import { InitialMessage } from '../constants';
import {
  IconArrowLeft,
  IconArrowsDiagonal2,
  IconArrowsDiagonalMinimize,
  IconSparkles,
} from '@tabler/icons-react';
import { useMessenger } from '../hooks/useMessenger';
import { CloseButton } from './CloseButton';
import { useInsertMessage } from '../hooks/useInsertMessage';
import { useCustomerData } from '../hooks/useCustomerData';
import { CustomerFormInline } from './customer-form-inline';

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
  const { goBack } = useMessenger();
  const { widgetsMessengerConnect } = connection || {};
  const { messengerData } = widgetsMessengerConnect || {};
  const {
    botGreetMessage,
    botShowInitialMessage,
    getStarted,
    messages: messagesConfig,
    responseRate,
    isOnline,
    requireAuth,
  } = messengerData || {};

  console.log('getStarted', getStarted);

  const { insertMessage } = useInsertMessage();
  const setConversationId = useSetAtom(setConversationIdAtom);
  const setIsBotTyping = useSetAtom(isBotTypingAtom);

  const handleGetStarted = useCallback(() => {
    setIsBotTyping(true);
    insertMessage({
      variables: { message: 'Get Started', contentType: 'getStarted' },
      onCompleted: (data) => {
        const newConversationId = data?.widgetsInsertMessage?.conversationId;
        if (newConversationId && !conversationId) {
          setConversationId(newConversationId);
        }
      },
    });
  }, [insertMessage, conversationId, setConversationId, setIsBotTyping]);

  const handleQuickReply = useCallback(
    (title: string) => {
      insertMessage({
        variables: { message: title, contentType: 'quickReply' },
      });
    },
    [insertMessage],
  );

  const handleTicketFormSubmit = useCallback(
    (payload: Record<string, string>) => {
      insertMessage({
        variables: {
          message: 'Ticket form submitted',
          contentType: 'ticketFormSubmission',
          payload: JSON.stringify(payload),
        },
      });
    },
    [insertMessage],
  );
  const { hasEmailOrPhone } = useCustomerData();
  const showAuthForm = requireAuth === true && !hasEmailOrPhone;

  const { conversationDetail, loading, isBotTyping } = useConversationDetail({
    variables: {
      _id: conversationId,
      integrationId: messengerConnectData?.integrationId ?? '',
    },
    skip: !conversationId || !messengerConnectData?.integrationId,
  });
  const { messages } = conversationDetail || {};

  const hasGetStartedMessage = messages?.some(
    (m) => m.contentType === 'getStarted',
  );

  const [operatorStatus, setOperatorStatus] = useAtom(operatorStatusAtom);
  const { toggle: toggleOperator } = useChangeOperatorStatus();

  useEffect(() => {
    if (conversationDetail?.operatorStatus) {
      setOperatorStatus(conversationDetail.operatorStatus);
    }
  }, [conversationDetail?.operatorStatus, setOperatorStatus]);

  const handleToggleOperator = () => {
    if (!conversationId) return;
    const next = operatorStatus === 'operator' ? 'bot' : 'operator';
    toggleOperator(conversationId, next);
  };

  const lastAgentUser = useMemo(() => {
    if (!messages) return null;
    return (
      [...messages].reverse().find((m) => !m.customerId && !m.fromBot && m.user)
        ?.user ?? null
    );
  }, [messages]);

  const isLastMessageFromBot = useMemo(() => {
    if (!messages || messages.length === 0) return false;
    return isBotMessage(messages[messages.length - 1]);
  }, [messages]);

  const lastBotMessageId = useMemo(() => {
    if (!messages) return null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (isBotMessage(messages[i])) return messages[i]._id;
    }
    return null;
  }, [messages]);

  const isTicketFormAlreadySubmitted = useMemo(() => {
    if (!messages) return false;
    // Find the last requestCreateTicket message
    let lastRequestIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if ((messages[i] as any).contentType === 'requestCreateTicket') {
        lastRequestIndex = i;
        break;
      }
    }
    // No ticket request in this conversation — hide any form
    if (lastRequestIndex === -1) return true;
    // Check if the last request was already answered by a ticketFormSubmission
    return messages
      .slice(lastRequestIndex + 1)
      .some((m) => (m as any).contentType === 'ticketFormSubmission');
  }, [messages]);

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

  const agentName =
    lastAgentUser?.details?.fullName ||
    lastAgentUser?.details?.firstName ||
    'Support';
  const agentAvatar = lastAgentUser?.details?.avatar;
  const subtitle = responseRate
    ? `usually replies in a few ${responseRate}`
    : 'usually replies in a few minutes';

  if (loading) {
    return <Skeleton className="w-full aspect-square" />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2.5 bg-(--color-hero) shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="text-primary-foreground rounded-2xl hover:bg-primary-foreground/10 size-8 shrink-0"
        >
          <IconArrowLeft className="size-4" />
        </Button>
        <div className="relative shrink-0">
          {isLastMessageFromBot ? (
            <div className="size-9 border-[0.5px] border-primary backdrop-blur-md rounded-lg bg-linear-120 from-primary to-primary-foreground/20 flex items-center justify-center">
              <IconSparkles className="size-5 text-primary-foreground" />
            </div>
          ) : (
            <Avatar className="size-9">
              {agentAvatar && (
                <Avatar.Image
                  src={readImage(agentAvatar)}
                  alt={agentName}
                  className="object-cover"
                />
              )}
              <Avatar.Fallback className="bg-primary-foreground/20 text-primary-foreground font-semibold text-sm">
                {agentName.charAt(0).toUpperCase()}
              </Avatar.Fallback>
            </Avatar>
          )}
          {isOnline && !isLastMessageFromBot && (
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-success border-2 border-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-primary-foreground font-semibold text-sm flex items-center gap-1.5 truncate">
            {isLastMessageFromBot ? (
              <>
                Ai bot
                <span className="inline-flex items-center rounded-sm px-1.5 text-xs font-medium h-5 bg-primary/20 text-primary-foreground border border-primary/30 shrink-0">
                  AI
                </span>
              </>
            ) : (
              agentName
            )}
          </div>
          <div className="text-primary-foreground/60 text-xs truncate flex items-center gap-1">
            {isLastMessageFromBot ? 'Automated · replies instantly' : subtitle}
          </div>
        </div>
        <span className="flex items-center">
          <ConversationDetailsDropdown />
          <CloseButton />
        </span>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth hide-scroll scroll-p-0 scroll-m-0 scroll-pt-16 flex flex-col-reverse p-4 space-y-2"
      >
        <AnimatePresence>
          {isBotTyping && <TypingStatus key="typing" />}
        </AnimatePresence>

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
                    groupIndex !== 0 && 'mt-3 w-full',
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
                      const isLastBot = message._id === lastBotMessageId;
                      return (
                        <BotMessage
                          key={message._id}
                          botData={message.botData}
                          createdAt={new Date(message.createdAt)}
                          showAvatar={message.showAvatar}
                          showOperatorToggle={isLastBot}
                          operatorStatus={operatorStatus ?? 'bot'}
                          onToggleOperator={handleToggleOperator}
                          onQuickReply={
                            isLastBot ? handleQuickReply : undefined
                          }
                          onTicketFormSubmit={
                            isLastBot && !isTicketFormAlreadySubmitted
                              ? handleTicketFormSubmit
                              : undefined
                          }
                          {...messagePositionProps}
                        />
                      );
                    }

                    if (isOperatorMessage(message)) {
                      return (
                        <OperatorMessage
                          key={message._id}
                          content={message.content}
                          src={
                            message.user?.details?.avatar || 'assets/user.webp'
                          }
                          createdAt={new Date(message.createdAt)}
                          showAvatar={message.showAvatar}
                          attachments={message.attachments}
                          userName={
                            message.user?.details?.fullName ||
                            message.user?.details?.firstName
                          }
                          {...messagePositionProps}
                        />
                      );
                    }

                    return (
                      <CustomerMessage
                        key={message._id}
                        content={message.content}
                        createdAt={new Date(message.createdAt)}
                        attachments={message.attachments}
                        {...messagePositionProps}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })}
        {botShowInitialMessage && (
          <BotMessage
            content={botGreetMessage}
            onGetStarted={
              getStarted && !hasGetStartedMessage ? handleGetStarted : undefined
            }
          />
        )}
        <WelcomeMessage
          content={messagesConfig?.welcome || InitialMessage.WELCOME}
        />
      </div>
      <AnimatePresence>
        {showAuthForm && <CustomerFormInline key="auth-form" />}
      </AnimatePresence>
    </div>
  );
};

export const ConversationDetailsDropdown = () => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const { resetExpand, expandWindow } = useMessenger();
  const handleExpanded = () => {
    if (expanded) {
      resetExpand();
    } else {
      expandWindow();
    }
    setExpanded(!expanded);
  };
  return (
    <button
      onClick={handleExpanded}
      className="text-primary-foreground hover:bg-primary-foreground/10 size-8 rounded-xl shrink-0 flex items-center justify-center cursor-pointer"
    >
      {expanded ? (
        <IconArrowsDiagonalMinimize className="size-4" />
      ) : (
        <IconArrowsDiagonal2 className="size-4" />
      )}
    </button>
  );
};
