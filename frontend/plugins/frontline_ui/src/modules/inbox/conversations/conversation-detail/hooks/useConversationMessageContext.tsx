import { useContext } from 'react';
import { ConversationMessageContext } from '@/inbox/conversations/context/ConversationMessageContext';
import { IMessage } from '@/inbox/types/Conversation';
import { differenceInMinutes } from 'date-fns';

export const useConversationMessageContext = () => {
  const context = useContext(ConversationMessageContext);

  if (!context) {
    throw new Error(
      'useConversationMessageContext must be used within a ConversationMessageContext',
    );
  }

  const { previousMessage, nextMessage, userId, customerId, createdAt } =
    context;

  const checkHasSibling = (message?: IMessage) => {
    if (!message) {
      return false;
    }

    const isClient = !userId;

    if (isClient) {
      return message.customerId === customerId;
    }

    return message.userId === userId;
  };

  const checkTimeDifference = (createdAt: string, compareDate: string) => {
    const minutes = Math.abs(
      differenceInMinutes(new Date(createdAt), new Date(compareDate)),
    );
    if (Math.abs(minutes) < 5) {
      return true;
    }

    return false;
  };

  const hasPreviousMessage = checkHasSibling(previousMessage);
  const hasNextMessage = checkHasSibling(nextMessage);

  const closeToPreviousMessage = checkTimeDifference(
    previousMessage?.createdAt || '',
    createdAt,
  );

  const closeToNextMessage = checkTimeDifference(
    nextMessage?.createdAt || '',
    createdAt,
  );

  return {
    ...context,
    hasPreviousMessage,
    separatePrevious: !closeToPreviousMessage || !hasPreviousMessage,
    separateNext: !closeToNextMessage || !hasNextMessage || !nextMessage,
  };
};
