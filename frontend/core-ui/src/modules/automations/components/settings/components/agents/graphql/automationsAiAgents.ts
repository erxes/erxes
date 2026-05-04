import { gql } from '@apollo/client';

const commonAIAgentParams = `
  $name: String,
  $description: String,
  $connection: JSON,
  $runtime: JSON,
  $context: JSON
`;

const commonAIAgentParamsDef = `
  name: $name,
  description: $description,
  connection: $connection,
  runtime: $runtime,
  context: $context
`;

export const AUTOMATIONS_AI_AGENT_ADD = gql`
  mutation AutomationsAiAgentAdd(${commonAIAgentParams}) {
    automationsAiAgentAdd(${commonAIAgentParamsDef})
  }
`;

export const AUTOMATIONS_AI_AGENT_EDIT = gql`
  mutation AutomationsAiAgentEdit($id: String!, ${commonAIAgentParams}) {
    automationsAiAgentEdit(_id: $id, ${commonAIAgentParamsDef})
  }
`;

export const AUTOMATIONS_AI_AGENT_DETAIL = gql`
  query AutomationsAiAgentDetail($id: String) {
    automationsAiAgentDetail(_id: $id)
  }
`;

export const AUTOMATIONS_AI_AGENTS = gql`
  query AutomationsAiAgents($kind: String) {
    automationsAiAgents(kind: $kind)
  }
`;

export const AUTOMATIONS_AI_AGENT_HEALTH = gql`
  query AutomationsAiAgentHealth($agentId: String!) {
    automationsAiAgentHealth(agentId: $agentId) {
      ready
      checkedAt
      errors
      warnings
      checks
    }
  }
`;
