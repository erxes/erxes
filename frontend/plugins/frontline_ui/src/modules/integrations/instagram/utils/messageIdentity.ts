import type { MessageSource } from '@/inbox/conversation-messages/utils/toMessage';
import { MESSAGE_PROVIDER_DATA_SCHEMA } from '@/inbox/types/messageSchema';

type MessageIdentity = Pick<MessageSource, '_id' | 'mid' | 'providerData'>;

const providerId = (message: MessageIdentity): string | undefined => {
  const parsed = MESSAGE_PROVIDER_DATA_SCHEMA.safeParse(message.providerData);
  return message.mid || (parsed.success ? parsed.data?.messageId : undefined);
};

export const isSameInstagramMessage = (
  left: MessageIdentity,
  right: MessageIdentity,
): boolean => {
  if (left._id === right._id) return true;
  const id = providerId(left);
  return Boolean(id && id === providerId(right));
};
