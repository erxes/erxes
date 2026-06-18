import { gql } from '@apollo/client';

export const MASTRA_THREAD_RENAME = gql`
  mutation MastraThreadRename($threadId: String!, $title: String!) {
    mastraThreadRename(threadId: $threadId, title: $title) {
      _id
      threadId
      title
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
      _id
      name
      agentId
      description
      instructions
      provider
      model
      toolPolicy
      allowedTools
      destructiveOps
      memoryEnabled
      maxSteps
      temperature
      isEnabled
      createdAt
      updatedAt
    }
  }
`;

export const MASTRA_AGENT_UPDATE = gql`
  mutation MastraAgentUpdate($_id: String!, $doc: MastraAgentInput!) {
    mastraAgentUpdate(_id: $_id, doc: $doc) {
      _id
      name
      agentId
      description
      instructions
      provider
      model
      toolPolicy
      allowedTools
      destructiveOps
      memoryEnabled
      maxSteps
      temperature
      isEnabled
      createdAt
      updatedAt
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
      _id
      provider
      label
      isDefault
      isEnabled
      isOpenAICompatible
      modelsEndpoint
      envKey
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
      _id
      erxesApiUrl
      erxesApiToken
      defaultAgentId
      attachmentsEnabled
    }
  }
`;

export const MASTRA_KNOWLEDGE_SYNC = gql`
  mutation MastraKnowledgeSync {
    mastraKnowledgeSync {
      ok
      queued
    }
  }
`;

export const MASTRA_MESSAGE_FEEDBACK = gql`
  mutation MastraMessageFeedback(
    $messageId: String!
    $rating: Int!
    $comment: String
  ) {
    mastraMessageFeedback(
      messageId: $messageId
      rating: $rating
      comment: $comment
    )
  }
`;

export const MASTRA_LEARNING_ADD = gql`
  mutation MastraLearningAdd($doc: MastraLearningInput!) {
    mastraLearningAdd(doc: $doc) {
      _id
      statement
      type
      status
    }
  }
`;

export const MASTRA_LEARNING_EDIT = gql`
  mutation MastraLearningEdit($_id: String!, $doc: MastraLearningInput!) {
    mastraLearningEdit(_id: $_id, doc: $doc) {
      _id
      statement
      type
      contextTags
      status
    }
  }
`;

export const MASTRA_LEARNING_SET_STATUS = gql`
  mutation MastraLearningSetStatus($_id: String!, $status: String!) {
    mastraLearningSetStatus(_id: $_id, status: $status) {
      _id
      status
    }
  }
`;

export const MASTRA_LEARNING_PIN = gql`
  mutation MastraLearningPin($_id: String!, $pinned: Boolean!) {
    mastraLearningPin(_id: $_id, pinned: $pinned) {
      _id
      pinned
    }
  }
`;

export const MASTRA_LEARNING_REMOVE = gql`
  mutation MastraLearningRemove($_id: String!) {
    mastraLearningRemove(_id: $_id)
  }
`;

export const MASTRA_WORKFLOW_CREATE = gql`
  mutation MastraWorkflowCreate($doc: MastraWorkflowInput!) {
    mastraWorkflowCreate(doc: $doc) {
      _id
      name
      description
      definition
      version
      isEnabled
      createdAt
      updatedAt
    }
  }
`;

export const MASTRA_WORKFLOW_UPDATE = gql`
  mutation MastraWorkflowUpdate($_id: String!, $doc: MastraWorkflowInput!) {
    mastraWorkflowUpdate(_id: $_id, doc: $doc) {
      _id
      name
      description
      definition
      version
      isEnabled
      createdAt
      updatedAt
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
      _id
      isEnabled
    }
  }
`;

export const MASTRA_WORKFLOW_VALIDATE = gql`
  mutation MastraWorkflowValidate($definition: JSON!) {
    mastraWorkflowValidate(definition: $definition)
  }
`;

export const MASTRA_SCHEDULE_CREATE = gql`
  mutation MastraScheduleCreate($doc: MastraScheduleInput!) {
    mastraScheduleCreate(doc: $doc) {
      _id
      name
      description
      agentId
      cron
      timezone
      prompt
      isEnabled
      createdAt
      updatedAt
    }
  }
`;

export const MASTRA_SCHEDULE_UPDATE = gql`
  mutation MastraScheduleUpdate(
    $_id: String!
    $doc: MastraScheduleUpdateInput!
  ) {
    mastraScheduleUpdate(_id: $_id, doc: $doc) {
      _id
      name
      description
      agentId
      cron
      timezone
      prompt
      isEnabled
      createdAt
      updatedAt
    }
  }
`;

export const MASTRA_SCHEDULE_REMOVE = gql`
  mutation MastraScheduleRemove($_id: String!) {
    mastraScheduleRemove(_id: $_id)
  }
`;

export const MASTRA_SCHEDULE_SET_ENABLED = gql`
  mutation MastraScheduleSetEnabled($_id: String!, $isEnabled: Boolean!) {
    mastraScheduleSetEnabled(_id: $_id, isEnabled: $isEnabled) {
      _id
      isEnabled
    }
  }
`;

export const MASTRA_SCHEDULE_RUN_NOW = gql`
  mutation MastraScheduleRunNow($_id: String!) {
    mastraScheduleRunNow(_id: $_id) {
      _id
      lastRunAt
      lastStatus
      lastError
      lastReply
      lastDurationMs
      runCount
    }
  }
`;

export const MASTRA_WORKFLOW_RUN_START = gql`
  mutation MastraWorkflowRunStart($_id: String!, $input: JSON) {
    mastraWorkflowRunStart(_id: $_id, input: $input) {
      _id
      workflowId
      version
      runId
      status
      startedAt
    }
  }
`;
