import type { IAgentPluginMeta } from 'erxes-api-shared/core-modules';

// Private conversations stay out of the AI assistant's discovery. Staff read
// them through the admin UI, where every access is audited.
export const agent: IAgentPluginMeta = {
  hiddenOperations: {
    queries: [
      'communicationMessagingAdminApps',
      'communicationMessagingAdminConversations',
      'communicationMessagingAdminConversation',
      'communicationMessagingAdminMessages',
      'communicationMessagingAdminParticipants',
    ],
  },
};
