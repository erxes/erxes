import { gql } from '@apollo/client';

export const AGENT_ASSISTANTS_ADD_MUTATION = gql`
  mutation AgentAssistantsAdd($doc: AgentAssistantInput!) {
    agentAssistantsAdd(doc: $doc) {
      _id
      name
      description
      modelProvider
      status
      createdAt
      updatedAt
    }
  }
`;

export const AGENT_ASSISTANTS_EDIT_MUTATION = gql`
  mutation AgentAssistantsEdit($_id: String!, $doc: AgentAssistantInput!) {
    agentAssistantsEdit(_id: $_id, doc: $doc) {
      _id
      name
      description
      modelProvider
      status
      createdAt
      updatedAt
    }
  }
`;

export const AGENT_ASSISTANTS_REMOVE_MUTATION = gql`
  mutation AgentAssistantsRemove($_id: String!) {
    agentAssistantsRemove(_id: $_id)
  }
`;
