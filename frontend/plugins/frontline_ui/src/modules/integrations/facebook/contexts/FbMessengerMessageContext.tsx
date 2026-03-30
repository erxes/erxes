import { createContext, useContext } from 'react';
import { IFacebookConversationMessage } from '../types/FacebookTypes';
import { differenceInMinutes } from 'date-fns';

export const FbMessengerMessageContext = createContext<
  | (IFacebookConversationMessage & {
      previousMessage?: IFacebookConversationMessage;
      nextMessage?: IFacebookConversationMessage;
    })
  | null
>(null);

export const useFbMessengerMessageContext = () => {
  const context = useContext(FbMessengerMessageContext);
  if (!context) {
    throw new Error(
      'useFbMessengerMessageContext must be used within a FbMessengerMessageContext',
    );
  }

  const { previousMessage, nextMessage, userId, customerId, createdAt, botData } =
    context;
  const isOutgoing = !!userId || !!botData?.length;

  const checkHasSibling = (message?: IFacebookConversationMessage) => {
    if (!message) {
      return false;
    }

    const isMessageOutgoing = !!message.userId || !!message.botData?.length;

    if (!isOutgoing) {
      return !isMessageOutgoing && message.customerId === customerId;
    }

    return isMessageOutgoing;
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
