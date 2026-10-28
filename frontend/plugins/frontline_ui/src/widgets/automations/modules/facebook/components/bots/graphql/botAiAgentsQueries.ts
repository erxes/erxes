import { gql } from '~/gql';

export const FACEBOOK_BOT_AI_AGENTS = gql(`
  query FacebookBotAiAgents {
    automationsAiAgents
  }
`);
