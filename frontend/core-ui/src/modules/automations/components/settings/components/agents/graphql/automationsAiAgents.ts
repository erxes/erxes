import { gql } from '@apollo/client';

const commonAIAgentParams = `
    $name: String,
    $description: String,
    $provider: String,
    $prompt: String,
    $instructions: String,
    $files: JSON,
    $config: JSON
`;

const commonAIAgentParamsDef = `
    name: $name,
    description: $description,
    provider: $provider,
    prompt: $prompt,
    instructions: $instructions,
    files: $files,
    config: $config
`;

export const AUTOMATIONS_AI_AGENT_ADD = gql`
    mutation AutomationsAiAgentAdd(${commonAIAgentParams}) {
      automationsAiAgentAdd(${commonAIAgentParamsDef})
    }
`;

export const AUTOMATIONS_AI_AGENT_EDIT = gql`
    mutation AutomationsAiAgentEdit($id: String!,${commonAIAgentParams}) {
      automationsAiAgentEdit(_id: $id,${commonAIAgentParamsDef})
    }
`;

export const AUTOMATIONS_AI_AGENT_DETAIL = gql`
  query AutomationsAiAgentDetail {
    automationsAiAgentDetail
  }
`;

export const AUTOMATIONS_AI_AGENTS = gql`
  query AutomationsAiAgents($kind: String) {
    automationsAiAgents(kind: $kind)
  }
`;
export const START_AI_TRAINING = gql`
  mutation StartAiTraining($agentId: String!) {
    startAiTraining(agentId: $agentId) {
      agentId
      totalFiles
      processedFiles
      status
      error
    }
  }
`;

export const GET_TRAINING_STATUS = gql`
  query GetTrainingStatus($agentId: String!) {
    getTrainingStatus(agentId: $agentId) {
      agentId
      totalFiles
      processedFiles
      status
      error
    }
  }
`;

export const GENERATE_AGENT_MESSAGE = gql`
  mutation GenerateAgentMessage($agentId: String!, $question: String!) {
    generateAgentMessage(agentId: $agentId, question: $question) {
      message
      relevantFile
      similarity
    }
  }
`;
