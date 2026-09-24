import { createContext, useContext } from 'react';
import { differenceInMinutes } from 'date-fns';
import { IWhatsappConversationMessage } from '../types/WhatsappTypes';

export const WhatsappMessengerMessageContext = createContext<
  | (IWhatsappConversationMessage & {
      previousMessage?: IWhatsappConversationMessage;
      nextMessage?: IWhatsappConversationMessage;
    })
  | null
>(null);

export const useWhatsappMessengerMessageContext = () => {
  const context = useContext(WhatsappMessengerMessageContext);

  if (!context) {
    throw new Error(
      'useWhatsappMessengerMessageContext must be used within a WhatsappMessengerMessageContext',
    );
  }

  const { previousMessage, nextMessage, userId, customerId, createdAt } =
    context;

  const checkHasSibling = (message?: IWhatsappConversationMessage) => {
    if (!message) {
      return false;
    }

    const isClient = !userId;

    if (isClient) {
      return message.customerId === customerId;
    }

    return message.userId === userId;
  };

  const checkTimeDifference = (date: string, compareDate: string) => {
    const minutes = Math.abs(
      differenceInMinutes(new Date(date), new Date(compareDate)),
    );

    return Math.abs(minutes) < 5;
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
