import type {
  MailMessage,
  MailReaction,
} from '@/integrations/mail/types/mailThread';

const REACTION_MIME_TYPE = 'text/vnd.google.email-reaction+json';

export const mailReactionFromMessage = (
  message: MailMessage,
): MailReaction | null => {
  const { mailData } = message;
  const sentReaction =
    mailData.type === 'SENT' &&
    mailData.reactionEmoji &&
    ['sent', 'pending'].includes(mailData.deliveryStatus ?? '');
  if (
    !sentReaction &&
    (mailData.type !== 'INBOX' ||
      !mailData.attachments?.some(
        (attachment) => attachment.mimeType === REACTION_MIME_TYPE,
      ))
  ) {
    return null;
  }

  const targetMessageId = mailData.inReplyTo ?? mailData.references?.at(-1);
  if (!targetMessageId || (!sentReaction && !mailData.body)) return null;

  const doc = new DOMParser().parseFromString(mailData.body ?? '', 'text/html');
  const emoji =
    mailData.reactionEmoji ?? doc.querySelector('p')?.textContent?.trim() ?? '';
  if (
    !emoji ||
    Array.from(emoji).length > 16 ||
    !/\p{Extended_Pictographic}/u.test(emoji)
  ) {
    return null;
  }

  return {
    emoji,
    sender: mailData.from?.[0]?.name || mailData.from?.[0]?.email || 'Someone',
    targetMessageId,
  };
};

export const groupMailReactions = (messages: MailMessage[]) => {
  const visibleMessages: MailMessage[] = [];
  const reactionsByMessageId = new Map<string, MailReaction[]>();
  const orphanReactions: MailReaction[] = [];
  const messageIds = new Set(messages.map(({ mailData }) => mailData.messageId));

  for (const message of messages) {
    const reaction = mailReactionFromMessage(message);
    if (!reaction) {
      visibleMessages.push(message);
      continue;
    }

    if (!messageIds.has(reaction.targetMessageId)) {
      orphanReactions.push(reaction);
      continue;
    }

    const previous = reactionsByMessageId.get(reaction.targetMessageId) ?? [];
    reactionsByMessageId.set(reaction.targetMessageId, [...previous, reaction]);
  }

  return { visibleMessages, reactionsByMessageId, orphanReactions };
};
