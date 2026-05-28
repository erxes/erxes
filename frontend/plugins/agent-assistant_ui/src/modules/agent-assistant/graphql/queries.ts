import { gql } from '@apollo/client';

export const AGENT_ASSISTANTS_QUERY = gql`
  query AgentAssistants($page: Int, $perPage: Int) {
    agentAssistants(page: $page, perPage: $perPage) {
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

export const AGENT_ASSISTANT_DETAIL_QUERY = gql`
  query AgentAssistantDetail($_id: String!) {
    agentAssistantDetail(_id: $_id) {
      _id
      name
      description
      modelProvider
      apiKey
      status
      createdAt
      updatedAt
    }
  }
`;
