import { MESSAGE_GROUP_TIME_WINDOW } from '../constants';

type GroupableMessage = {
  botData?: unknown;
  customerId?: string | null;
  fromBot?: boolean | null;
  userId?: string | null;
};

export const isOperatorMessage = (message: GroupableMessage): boolean =>
  !message.customerId && !message.fromBot;

export const isBotMessage = (message: GroupableMessage): boolean =>
  Boolean(message.fromBot);

export const isCustomerJoined = (message: GroupableMessage): boolean =>
  Boolean(message.fromBot && message.botData === null);

export const shouldGroupMessages = (
  message: GroupableMessage,
  groupFirstMessage: GroupableMessage,
  timeDifference: number,
): boolean => {
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
};
