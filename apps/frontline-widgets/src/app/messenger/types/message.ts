export type MessagePosition = {
  isFirstMessage?: boolean;
  isLastMessage?: boolean;
  isMiddleMessage?: boolean;
  isSingleMessage?: boolean;
};

export type MessageVariant = 'incoming' | 'outgoing' | 'bot';
