import { stripHtml } from 'erxes-ui';
import type { IMessage } from '@/inbox/types/Conversation';

export const FORWARDED_MARKER =
  /(?:^|<p(?:\s[^>]*)?>|<br\s*\/?>|\r?\n)↪ Forwarded(?=\s|<|$)/i;

export const stripForwardedMarkers = (content: string) =>
  content.replace(
    /↪ Forwarded(?:[ \t]*<br\s*\/?>|[ \t]*\r?\n|[ \t]*)/gi,
    '',
  ).replace(/\n{2,}/g, '\n').trim();

export const textOf = (message: IMessage) =>
  stripHtml(message.content) ||
  message.providerData?.previewText ||
  message.attachments?.[0]?.name ||
  'Attachment';

export const previewOf = (message: IMessage) => textOf(message).slice(0, 120);
