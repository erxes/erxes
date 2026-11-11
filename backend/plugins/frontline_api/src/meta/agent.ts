import { IAgentPluginMeta } from 'erxes-api-shared/core-modules';
import { CHANNELS_CALLS_SKILL, CONVERSATIONS_SKILL } from '~/meta/agentSkills';

/** What frontline contributes to the core AI assistant. */
export const agent: IAgentPluginMeta = {
  skills: [
    {
      name: 'conversations',
      description:
        'Team inbox conversations: volume and reports by channel, source, agent or tag, the inbox queue and conversation lists. Use for any conversation count, report or list.',
      instructions: CONVERSATIONS_SKILL,
    },
    {
      name: 'channels-calls',
      description:
        'Channels, integrations, brands and phone numbers; call history and call stats; tickets; repeat contacts and per-customer conversation counts the API cannot aggregate.',
      instructions: CHANNELS_CALLS_SKILL,
    },
  ],
};
