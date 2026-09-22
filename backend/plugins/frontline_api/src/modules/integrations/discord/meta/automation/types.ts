/**
 * The target object `receiveDiscordMessage` enrolls into automations for the
 * Discord message trigger — the single source of truth for the shape every
 * worker (trigger keyword match, AI context, typing indicator) reads back off
 * the execution. The automation bridge transports targets as untyped records,
 * so producers build this type and consumers cast back to it.
 */
export type TDiscordTriggerTarget = {
  // Discord message snowflake.
  _id: string;
  content: string;
  // Inbox conversation id (`erxesApiId`).
  conversationId?: string;
  // Core customer id (`erxesApiId`).
  customerId?: string;
  channelId: string;
  guildId?: string;
  authorId: string;
  botId: string;
  createdAt?: Date | string;
};

// Config of the Discord message trigger, set in the trigger form: an optional
// comma-separated keyword filter on the message content.
export type TDiscordTriggerConfig = {
  keywords?: string;
};
