export type TComposerPoll = {
  question?: string;
  options?: unknown[];
  duration?: number | string;
  allowMultiselect?: boolean;
};

export type TInboxAttachment = { url?: string; name?: string; type?: string };

export type TInboxRelayDoc = {
  integrationId?: string;
  conversationId?: string;
  content?: string;
  userId?: string;
  attachments?: TInboxAttachment[];
  poll?: TComposerPoll;
  typing?: boolean;
  replyToMessageId?: string;
  messageId?: string;
  reaction?: string;
  remove?: boolean;
  extraInfo?: {
    forwardedNote?: string;
    forwardedFrom?: {
      conversationId?: string;
      messageId?: string;
    };
  };
};

export type TNativeForwardReference = {
  type: 1;
  messageId: string;
  channelId: string;
  guildId?: string;
};
