type BotItem = Record<string, unknown>;

const isBotItem = (item: unknown): item is BotItem =>
  typeof item === 'object' && item !== null;

export const getBotMessageParts = (botData: unknown) => {
  const allItems: unknown[] = Array.isArray(botData) ? botData : [];
  const items = allItems.filter(isBotItem);
  const quickReplyItem = items.find(({ type }) => type === 'quickReplies');
  const textItems = items.filter(
    ({ type }) => type !== 'quickReplies' && type !== 'ticketForm',
  );

  return {
    hasTicketForm: items.some(({ type }) => type === 'ticketForm'),
    hasTextItems: allItems.some(
      (item) =>
        !isBotItem(item) ||
        (item.type !== 'quickReplies' && item.type !== 'ticketForm'),
    ),
    displayText: textItems
      .map(({ text, content }) => text || content || '')
      .join(''),
    text: textItems
      .map(({ text, content }) =>
        typeof text === 'string'
          ? text
          : typeof content === 'string'
          ? content
          : '',
      )
      .join(''),
    quickReplies: Array.isArray(quickReplyItem?.elements)
      ? (quickReplyItem.elements as Array<{ title: string }>)
      : [],
  };
};

export const isTicketFormSubmitted = (
  messages?: Array<{ contentType?: string }>,
): boolean => {
  if (!messages) return false;
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].contentType !== 'requestCreateTicket') continue;
    return messages
      .slice(index + 1)
      .some(({ contentType }) => contentType === 'ticketFormSubmission');
  }

  return true;
};
