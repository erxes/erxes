export type MessageBubbleOptions = {
  userId?: string;
  internal?: boolean;
  fromBot?: boolean;
  isBotMessage?: boolean;
  separatePrevious: boolean;
  showAuthorName: boolean;
  showBotName: boolean;
  hasReply?: boolean;
};
