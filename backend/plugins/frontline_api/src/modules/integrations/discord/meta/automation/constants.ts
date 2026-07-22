import {
  DISCORD_MESSAGE_COLLECTION,
  DISCORD_MODULE_NAME,
} from '@/integrations/discord/constants';

// Trigger fields, addressable in actions as {{ trigger.<key> }} — e.g.
// {{ trigger.content }} feeds the AI Agent input.
const discordMessageTriggerOutput = {
  variables: [
    { key: '_id', label: 'Message ID' },
    { key: 'content', label: 'Message content' },
    { key: 'conversationId', label: 'Conversation ID' },
    { key: 'customerId', label: 'Customer ID' },
    { key: 'channelId', label: 'Discord channel ID' },
    { key: 'guildId', label: 'Discord server ID' },
    { key: 'authorId', label: 'Discord user ID' },
    { key: 'botId', label: 'Bot ID' },
    { key: 'createdAt', label: 'Message created at' },
  ],
};

const discordMessageActionOutput = {
  variables: [
    { key: 'messageId', label: 'Sent message ID' },
    { key: 'content', label: 'Sent message content' },
    { key: 'conversationId', label: 'Conversation ID' },
  ],
};

export const discordConstants = {
  actions: [
    {
      moduleName: DISCORD_MODULE_NAME,
      collectionName: DISCORD_MESSAGE_COLLECTION,
      method: 'create',
      icon: 'IconBrandDiscord',
      label: 'Send Discord Message',
      description: 'Reply to the Discord channel as the bot.',
      output: discordMessageActionOutput,
    },
  ],
  triggers: [
    {
      moduleName: DISCORD_MODULE_NAME,
      collectionName: DISCORD_MESSAGE_COLLECTION,
      icon: 'IconBrandDiscord',
      label: 'Discord Message',
      description:
        'Start this workflow when the bot receives a Discord channel message.',
      isCustom: true,
      output: discordMessageTriggerOutput,
    },
  ],
};
