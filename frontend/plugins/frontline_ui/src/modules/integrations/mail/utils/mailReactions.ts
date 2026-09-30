import type {
  MailMessage,
  MailReaction,
} from '@/integrations/mail/types/mailThread';

const REACTION_MIME_TYPE = 'text/vnd.google.email-reaction+json';

const graphemes = (value: string): string[] => {
  const Segmenter = (
    Intl as typeof Intl & {
      Segmenter: new (locale: string, options: { granularity: 'grapheme' }) => {
        segment: (input: string) => Iterable<{ segment: string }>;
      };
    }
  ).Segmenter;
  return [
    ...new Segmenter('en', { granularity: 'grapheme' }).segment(value),
  ].map(({ segment }) => segment);
};

const reactionEmojiFromBody = (body?: string): string | null => {
  if (!body) return null;

  const doc = new DOMParser().parseFromString(body, 'text/html');
  const text = doc.body.textContent?.trim() ?? '';
  const candidate =
    doc.querySelector('p')?.textContent?.trim() ?? graphemes(text)[0] ?? '';
  const hasReactionFallback =
    text === candidate ||
    /^(?:.+\s)?reacted (?:to your email|via gmail)\.?$/i.test(
      text.slice(candidate.length).trim(),
    );
  if (!hasReactionFallback) return null;

  return graphemes(candidate).length === 1 &&
    /\p{Extended_Pictographic}/u.test(candidate)
    ? candidate
    : null;
};

export const mailReactionFromMessage = (
  message: MailMessage,
): MailReaction | null => {
  const { mailData } = message;
  const sentReaction =
    mailData.type === 'SENT' &&
    mailData.reactionEmoji &&
    ['sent', 'pending'].includes(mailData.deliveryStatus ?? '');
  const hasReactionPart = mailData.attachments?.some(
    (attachment) => attachment.mimeType === REACTION_MIME_TYPE,
  );
  const fallbackEmoji = reactionEmojiFromBody(mailData.body);
  if (
    !sentReaction &&
    (mailData.type !== 'INBOX' ||
      (!hasReactionPart && !fallbackEmoji && !mailData.reactionEmoji))
  ) {
    return null;
  }

  const targetMessageId = mailData.inReplyTo ?? mailData.references?.at(-1);
  if (!targetMessageId) return null;

  const emoji =
    mailData.reactionEmoji ??
    (hasReactionPart
      ? new DOMParser()
          .parseFromString(mailData.body ?? '', 'text/html')
          .querySelector('p')
          ?.textContent?.trim()
      : fallbackEmoji) ??
    '';
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
    if (!targetMessageId) {
      orphanReactions.push(reaction);
      continue;
    }

    const previous = reactionsByMessageId.get(targetMessageId) ?? [];
    reactionsByMessageId.set(targetMessageId, [...previous, reaction]);
  }

  return { visibleMessages, reactionsByMessageId, orphanReactions };
};
