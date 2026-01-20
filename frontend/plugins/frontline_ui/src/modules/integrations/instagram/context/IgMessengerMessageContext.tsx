import { createContext, useContext } from 'react';
import { IInstagramConversationMessage } from '../types/InstagramTypes';
import { differenceInMinutes } from 'date-fns';

export const IgMessengerMessageContext = createContext<
  | (IInstagramConversationMessage & {
      previousMessage?: IInstagramConversationMessage;
      nextMessage?: IInstagramConversationMessage;
    })
  | null
>(null);

export const useIgMessengerMessageContext = () => {
  const context = useContext(IgMessengerMessageContext);
  if (!context) {
    throw new Error(
      'useIgMessengerMessageContext must be used within a IgMessengerMessageContext',
    );
  }

  const { previousMessage, nextMessage, userId, customerId, createdAt } =
    context;

  const checkHasSibling = (message?: IInstagramConversationMessage) => {
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
