import { gql } from '@apollo/client';

export const MASTRA_THREAD_RENAME = gql`
  mutation MastraThreadRename($threadId: String!, $title: String!) {
    mastraThreadRename(threadId: $threadId, title: $title) {
      _id threadId title
    }
  }
`;

export const MASTRA_THREAD_REMOVE = gql`
  mutation MastraThreadRemove($threadId: String!) {
    mastraThreadRemove(threadId: $threadId)
  }
`;

export const MASTRA_AGENT_CREATE = gql`
  mutation MastraAgentCreate($doc: MastraAgentInput!) {
    mastraAgentCreate(doc: $doc) {
      _id name agentId description instructions provider model
      toolPolicy allowedTools memoryEnabled maxSteps isEnabled createdAt updatedAt
    }
  }
`;

export const MASTRA_AGENT_UPDATE = gql`
  mutation MastraAgentUpdate($_id: String!, $doc: MastraAgentInput!) {
    mastraAgentUpdate(_id: $_id, doc: $doc) {
      _id name agentId description instructions provider model
      toolPolicy allowedTools memoryEnabled maxSteps isEnabled createdAt updatedAt
    }
  }
`;

export const MASTRA_AGENT_REMOVE = gql`
  mutation MastraAgentRemove($_id: String!) {
    mastraAgentRemove(_id: $_id)
  }
`;

export const MASTRA_PROVIDER_SAVE = gql`
  mutation MastraProviderSave($doc: MastraProviderInput!) {
    mastraProviderSave(doc: $doc) {
      _id provider label isDefault isEnabled
      isOpenAICompatible modelsEndpoint envKey
    }
  }
`;

export const MASTRA_PROVIDER_REMOVE = gql`
  mutation MastraProviderRemove($_id: String!) {
    mastraProviderRemove(_id: $_id)
  }
`;

export const MASTRA_SETTINGS_SAVE = gql`
  mutation MastraSettingsSave($doc: MastraSettingsInput!) {
    mastraSettingsSave(doc: $doc) {
      _id erxesApiUrl erxesApiToken defaultAgentId attachmentsEnabled searchApiKey searchProvider
    }
  }
`;


export const MASTRA_WORKFLOW_CREATE = gql`
  mutation MastraWorkflowCreate($doc: MastraWorkflowInput!) {
    mastraWorkflowCreate(doc: $doc) {
      _id name description definition version isEnabled createdAt updatedAt
    }
  }
`;

export const MASTRA_WORKFLOW_UPDATE = gql`
  mutation MastraWorkflowUpdate($_id: String!, $doc: MastraWorkflowInput!) {
    mastraWorkflowUpdate(_id: $_id, doc: $doc) {
      _id name description definition version isEnabled createdAt updatedAt
    }
  }
`;

export const MASTRA_WORKFLOW_REMOVE = gql`
  mutation MastraWorkflowRemove($_id: String!) {
    mastraWorkflowRemove(_id: $_id)
  }
`;

export const MASTRA_WORKFLOW_SET_ENABLED = gql`
  mutation MastraWorkflowSetEnabled($_id: String!, $isEnabled: Boolean!) {
    mastraWorkflowSetEnabled(_id: $_id, isEnabled: $isEnabled) {
      _id isEnabled
    }
  }
`;

export const MASTRA_WORKFLOW_VALIDATE = gql`
  mutation MastraWorkflowValidate($definition: JSON!) {
    mastraWorkflowValidate(definition: $definition)
  }
`;

export const MASTRA_WORKFLOW_RUN_START = gql`
  mutation MastraWorkflowRunStart($_id: String!, $input: JSON) {
    mastraWorkflowRunStart(_id: $_id, input: $input) {
      _id workflowId version runId status startedAt
    }
  }
`;
