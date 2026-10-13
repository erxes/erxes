import { MESSAGE_GROUP_TIME_WINDOW } from '../constants';
import { getDateKey } from '@libs/formatDate';

type GroupableMessage = {
  botData?: unknown;
  customerId?: string | null;
  fromBot?: boolean | null;
  userId?: string | null;
};

type DatedMessage = GroupableMessage & {
  createdAt: Date | string;
};

export type MessageGroup<T extends DatedMessage> = {
  messages: Array<T & { showAvatar: boolean }>;
  firstMessage: T;
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

export const groupMessagesByDate = <T extends DatedMessage>(messages: T[]) => {
  const grouped: Record<string, T[]> = {};

  messages.forEach((message) => {
    const dateKey = getDateKey(message.createdAt);
    (grouped[dateKey] ||= []).push(message);
  });

  Object.values(grouped).forEach((dailyMessages) => {
    dailyMessages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  });

  return grouped;
};

export const groupMessagesByTimeAndUser = <T extends DatedMessage>(
  messages: T[],
): Array<MessageGroup<T>> => {
  const groups: Array<MessageGroup<T>> = [];

  messages.forEach((message) => {
    const lastGroup = groups[groups.length - 1];
    const timeDifference = lastGroup
      ? Math.abs(
          new Date(message.createdAt).getTime() -
            new Date(lastGroup.firstMessage.createdAt).getTime(),
        )
      : 0;

    if (
      lastGroup &&
      shouldGroupMessages(message, lastGroup.firstMessage, timeDifference)
    ) {
      lastGroup.messages.push({ ...message, showAvatar: true });
    } else {
      groups.push({
        messages: [{ ...message, showAvatar: true }],
        firstMessage: message,
      });
    }
  });

  groups.forEach(({ messages: groupedMessages }) => {
    groupedMessages.forEach((message, index) => {
      message.showAvatar = index === groupedMessages.length - 1;
    });
  });

  return groups;
};
