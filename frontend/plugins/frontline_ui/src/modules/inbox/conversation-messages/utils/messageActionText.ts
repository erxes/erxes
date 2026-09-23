import { stripHtml } from 'erxes-ui';
import type { IMessage } from '@/inbox/types/Conversation';

export const textOf = (message: IMessage) =>
  stripHtml(message.content) ||
  message.providerData?.previewText ||
  message.attachments?.[0]?.name ||
  'Attachment';

export const previewOf = (message: IMessage) => textOf(message).slice(0, 120);
