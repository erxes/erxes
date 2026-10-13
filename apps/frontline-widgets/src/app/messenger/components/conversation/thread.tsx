import { useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import { cn } from 'erxes-ui';
import { formatMessageDate } from '@libs/formatDate';
import { DateSeparator } from '../date-separator';
import { TypingStatus } from '../typing-status';
import { BotMessage, WelcomeMessage } from './bot-message';
import {
  OperatorMessage,
  CustomerMessage,
} from './participant-messages';
import { InitialMessage } from '../../constants';
import type { IAttachment, IMessage } from '../../types';
import { getBotMessageParts, isTicketFormSubmitted } from '../../utils/botMessage';
import {
  groupMessagesByDate,
  groupMessagesByTimeAndUser,
  isBotMessage,
  isCustomerJoined,
  isOperatorMessage,
} from '../../utils/messageGrouping';

type ConversationThreadProps = {
  messages?: IMessage[];
  isBotTyping: boolean;
  aiAgentLabel?: string;
  operatorStatus: 'bot' | 'operator' | null;
  botShowInitialMessage?: boolean;
  botGreetMessage?: string;
  getStarted?: boolean;
  welcomeMessage?: string;
  onToggleOperator: () => void;
  onQuickReply: (title: string) => void;
  onTicketFormSubmit: (payload: Record<string, string>) => void;
  onReply: (
    authorName: string,
    content?: string,
    attachments?: IAttachment[],
  ) => void;
  onCopy: (content?: string, attachments?: IAttachment[]) => Promise<void>;
  onGetStarted: () => void;
};

export function ConversationThread({
  messages,
  isBotTyping,
  aiAgentLabel,
  operatorStatus,
  botShowInitialMessage,
  botGreetMessage,
  getStarted,
  welcomeMessage,
  onToggleOperator,
  onQuickReply,
  onTicketFormSubmit,
  onReply,
  onCopy,
  onGetStarted,
}: ConversationThreadProps) {
  const messagesByDate = useMemo(
    () => groupMessagesByDate(messages || []),
    [messages],
  );
  const sortedDateKeys = useMemo(
    () =>
      Object.keys(messagesByDate).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime(),
      ),
    [messagesByDate],
  );
  const lastBotMessageId = [...(messages || [])]
    .reverse()
    .find(isBotMessage)?._id;
  const isTicketFormAlreadySubmitted = isTicketFormSubmitted(messages);
  const hasGetStartedMessage = messages?.some(
    ({ contentType }) => contentType === 'getStarted',
  );
  const shouldShowWelcomeMessage =
    Boolean(welcomeMessage) && !botShowInitialMessage;

  return (
    <div className="flex-1 overflow-y-auto scroll-smooth hide-scroll scroll-p-0 scroll-m-0 scroll-pt-16 flex flex-col-reverse p-4 space-y-2">
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
                className={cn(groupIndex !== 0 && 'mt-3 w-full', 'space-y-0.5')}
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

                  if (isCustomerJoined(message)) {
                    return null;
                  }

                  if (isBotMessage(message)) {
                    const isLastBot = message._id === lastBotMessageId;
                    const botContent =
                      getBotMessageParts(message.botData).text ||
                      message.content;
                    return (
                      <BotMessage
                        key={message._id}
                        botData={message.botData}
                        createdAt={new Date(message.createdAt)}
                        showAvatar={message.showAvatar}
                        showOperatorToggle={isLastBot}
                        operatorStatus={operatorStatus ?? 'bot'}
                        onToggleOperator={onToggleOperator}
                        onQuickReply={isLastBot ? onQuickReply : undefined}
                        onTicketFormSubmit={
                          isLastBot && !isTicketFormAlreadySubmitted
                            ? onTicketFormSubmit
                            : undefined
                        }
                        onReply={() =>
                          onReply(
                            aiAgentLabel || 'AI Agent',
                            botContent,
                            message.attachments,
                          )
                        }
                        onCopy={() => onCopy(botContent, message.attachments)}
                        {...messagePositionProps}
                      />
                    );
                  }

                  if (isOperatorMessage(message)) {
                    const operatorName =
                      message.user?.details?.fullName ||
                      message.user?.details?.firstName ||
                      'Operator';
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
                        userName={operatorName}
                        onReply={() =>
                          onReply(
                            operatorName,
                            message.content,
                            message.attachments,
                          )
                        }
                        onCopy={() =>
                          onCopy(message.content, message.attachments)
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
                      onReply={() =>
                        onReply('You', message.content, message.attachments)
                      }
                      onCopy={() =>
                        onCopy(message.content, message.attachments)
                      }
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
          content={
            botGreetMessage?.length ? botGreetMessage : InitialMessage.WELCOME
          }
          onGetStarted={
            getStarted && !hasGetStartedMessage ? onGetStarted : undefined
          }
        />
      )}
      {shouldShowWelcomeMessage && (
        <WelcomeMessage content={welcomeMessage || InitialMessage.WELCOME} />
      )}
    </div>
  );
}
