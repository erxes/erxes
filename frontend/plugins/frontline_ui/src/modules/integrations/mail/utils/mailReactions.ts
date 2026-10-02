import type {
  MailMessage,
  MailReaction,
} from '@/integrations/mail/types/mailThread';

const REACTION_MIME_TYPE = 'text/vnd.google.email-reaction+json';

const graphemes = (value: string): string[] => {
  const Segmenter = (
    Intl as typeof Intl & {
      Segmenter: new (
        locale: string,
        options: { granularity: 'grapheme' },
      ) => {
        segment: (input: string) => Iterable<{ segment: string }>;
      };
    }
  ).Segmenter;
  return [
    ...new Segmenter('en', { granularity: 'grapheme' }).segment(value),
  ].map(({ segment }) => segment);
};

export const mailReactionFromMessage = (
  message: MailMessage,
): MailReaction | null => {
  const { mailData } = message;
  const targetMessageId = mailData.inReplyTo ?? mailData.references?.at(-1);
  if (!targetMessageId) return null;

  const sentReaction =
    mailData.type === 'SENT' &&
    mailData.reactionEmoji &&
    ['sent', 'pending'].includes(mailData.deliveryStatus ?? '');
  if (!sentReaction && mailData.type !== 'INBOX') return null;

  if (!mailData.reactionEmoji) return null;

  // A reaction chip cannot show a regular attachment. Keep the email visible
  // whenever it also carries files that the user needs to open.
  if (
    mailData.attachments?.some(
      ({ mimeType, disposition }) =>
        mimeType !== REACTION_MIME_TYPE && disposition !== 'inline',
    )
  )
    return null;

  const emoji = mailData.reactionEmoji;
  if (
    !emoji ||
    new TextEncoder().encode(emoji).length > 64 ||
    graphemes(emoji).length !== 1 ||
    !(
      /\p{Extended_Pictographic}/u.test(emoji) ||
      /^(?:[\u{1F1E6}-\u{1F1FF}]){2}$/u.test(emoji) ||
      /^[#*0-9]\uFE0F?\u20E3$/u.test(emoji)
    )
  ) {
    return null;
  }

  return {
    messageId: message._id,
    emoji,
    sender: mailData.from?.[0]?.name || mailData.from?.[0]?.email || 'Someone',
    senderAddress: mailData.from?.[0]?.email,
    isOwn: mailData.type === 'SENT',
    targetMessageId,
  };
};

export const groupMailReactions = (messages: MailMessage[]) => {
  const visibleMessages: MailMessage[] = [];
  const reactionsByMessageId = new Map<string, MailReaction[]>();
  const messageIdByWireId = new Map<string, string>();
  for (const { mailData } of messages) {
    if (!mailData.messageId) continue;
    messageIdByWireId.set(mailData.messageId, mailData.messageId);
    if (mailData.providerMessageId) {
      messageIdByWireId.set(mailData.providerMessageId, mailData.messageId);
    }
  }

  for (const message of messages) {
    const reaction = mailReactionFromMessage(message);
    if (!reaction) {
      visibleMessages.push(message);
      continue;
    }

    const targetMessageId = messageIdByWireId.get(reaction.targetMessageId);
    if (!targetMessageId) continue;

    const previous = reactionsByMessageId.get(targetMessageId);
    if (previous) {
      previous.push(reaction);
    } else {
      reactionsByMessageId.set(targetMessageId, [reaction]);
    }
  }

  return { visibleMessages, reactionsByMessageId };
};
