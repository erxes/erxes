import { createContext, useContext } from 'react';
import { differenceInMinutes } from 'date-fns';
import { ICallConversationNote } from '@/integrations/call/types/callTypes';

export const callConversationNoteContext = createContext<
  | (ICallConversationNote & {
      previousMessage?: ICallConversationNote;
      nextMessage?: ICallConversationNote;
    })
  | null
>(null);

export const useCallConversationNoteContext = () => {
  const context = useContext(callConversationNoteContext);
  if (!context) {
    throw new Error(
      'useCallConversationNoteContext must be used within a callConversationNoteContext',
    );
  }

  const { previousMessage, nextMessage, userId, customerId, createdAt } =
    context;

  const checkHasSibling = (message?: ICallConversationNote) => {
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
