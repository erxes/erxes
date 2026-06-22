import { gql } from '@apollo/client';

export const AGENT_FIELDS = gql`
  fragment AgentFields on MastraAgent {
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
`;

export const WORKFLOW_FIELDS = gql`
  fragment WorkflowFields on MastraWorkflow {
    _id
    name
    description
    definition
    version
    isEnabled
    createdAt
    updatedAt
  }
`;

export const SCHEDULE_FIELDS = gql`
  fragment ScheduleFields on MastraSchedule {
    _id
    name
    description
    agentId
    cron
    timezone
    prompt
    isEnabled
    threadId
    lastRunAt
    lastStatus
    lastError
    lastReply
    lastDurationMs
    runCount
    createdAt
    updatedAt
  }
`;

export const MASTRA_AGENTS = gql`
  query MastraAgents {
    mastraAgents {
      ...AgentFields
    }
  }
  ${AGENT_FIELDS}
`;

export const MASTRA_AGENTS_MAIN = gql`
  query MastraAgentsMain($page: Int, $perPage: Int, $searchValue: String) {
    mastraAgentsMain(
      page: $page
      perPage: $perPage
      searchValue: $searchValue
    ) {
      list {
        _id
        name
        agentId
        description
        provider
        model
        toolPolicy
        allowedTools
        isEnabled
        createdAt
      }
      totalCount
    }
  }
`;

export const MASTRA_AGENT = gql`
  query MastraAgent($_id: String!) {
    mastraAgent(_id: $_id) {
      ...AgentFields
    }
  }
  ${AGENT_FIELDS}
`;

export const MASTRA_AGENT_CHAT = gql`
  query MastraAgentChat(
    $agentId: String!
    $message: String!
    $threadId: String
  ) {
    mastraAgentChat(agentId: $agentId, message: $message, threadId: $threadId)
  }
`;

export const MASTRA_THREADS = gql`
  query MastraThreads($agentId: String!) {
    mastraThreads(agentId: $agentId) {
      _id
      threadId
      title
      messageCount
      lastMessageAt
      createdAt
    }
  }
`;

export const MASTRA_THREAD_MESSAGES = gql`
  query MastraThreadMessages($threadId: String!) {
    mastraThreadMessages(threadId: $threadId) {
      _id
      role
      content
      meta
      attachments
      createdAt
    }
  }
`;

export const MASTRA_ATTACHMENT_STORAGE_STATUS = gql`
  query MastraAttachmentStorageStatus {
    mastraAttachmentStorageStatus {
      configured
      serviceType
      enabled
    }
  }
`;

export const MASTRA_AVAILABLE_ERXES_TOOLS = gql`
  query MastraAvailableErxesTools {
    mastraAvailableErxesTools {
      plugin
      module
      operation
      operationType
      description
      graphqlArgs
      returnType
    }
  }
`;

export const MASTRA_PROVIDERS = gql`
  query MastraProviders {
    mastraProviders {
      _id
      provider
      label
      apiKey
      baseUrl
      isDefault
      isEnabled
      isOpenAICompatible
      modelsEndpoint
      envKey
      headers
      createdAt
    }
  }
`;

export const MASTRA_PROVIDER_CATALOG = gql`
  query MastraProviderCatalog {
    mastraProviderCatalog {
      provider
      label
      isOpenAICompatible
      isConfigured
    }
  }
`;

export const MASTRA_PROVIDER_PRESETS = gql`
  query MastraProviderPresets {
    mastraProviderPresets {
      provider
      label
      isOpenAICompatible
      envKey
      baseUrl
      modelsEndpoint
      headers
    }
  }
`;

export const MASTRA_PROVIDER_MODELS = gql`
  query MastraProviderModels($provider: String!) {
    mastraProviderModels(provider: $provider) {
      id
      name
    }
  }
`;

export const MASTRA_SETTINGS = gql`
  query MastraSettings {
    mastraSettings {
      _id
      erxesApiUrl
      erxesApiToken
      defaultAgentId
      attachmentsEnabled
      attachmentStorage {
        configured
        serviceType
        enabled
      }
      advancedMemory
      advancedMemoryStatus {
        enabled
        embedder
        embedderModel
        qdrantUrl
        qdrantReachable
        collection
      }
      knowledgeStatus {
        enabled
        embedder
        embedderModel
        qdrantUrl
        qdrantReachable
        collection
        enabledTypes
        lastSweepAt
        pointCount
        types
        lastError
      }
    }
  }
`;

export const MASTRA_LEARNINGS = gql`
  query MastraLearnings(
    $status: String
    $type: String
    $searchValue: String
    $page: Int
    $perPage: Int
  ) {
    mastraLearnings(
      status: $status
      type: $type
      searchValue: $searchValue
      page: $page
      perPage: $perPage
    ) {
      list {
        _id
        statement
        type
        contextTags
        agentId
        status
        confidence
        evidenceCount
        sourceCount
        pinned
        createdBy
        lastReinforcedAt
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

export const MASTRA_LEARNING_STATS = gql`
  query MastraLearningStats {
    mastraLearningStats
  }
`;

export const MASTRA_LEARNING_STATUS = gql`
  query MastraLearningStatus {
    mastraLearningStatus {
      enabled
      embedder
      embedderModel
      qdrantUrl
      collection
      autoPromoteMinSources
      autoPromoteMinConfidence
    }
  }
`;

export const MASTRA_MESSAGE_FEEDBACKS = gql`
  query MastraMessageFeedbacks($threadId: String!) {
    mastraMessageFeedbacks(threadId: $threadId)
  }
`;

export const MASTRA_WORKFLOWS = gql`
  query MastraWorkflows {
    mastraWorkflows {
      ...WorkflowFields
    }
  }
  ${WORKFLOW_FIELDS}
`;

export const MASTRA_WORKFLOW = gql`
  query MastraWorkflow($_id: String!) {
    mastraWorkflow(_id: $_id) {
      ...WorkflowFields
      createdByUserId
    }
  }
  ${WORKFLOW_FIELDS}
`;

export const MASTRA_SCHEDULES = gql`
  query MastraSchedules {
    mastraSchedules {
      ...ScheduleFields
    }
  }
  ${SCHEDULE_FIELDS}
`;

export const MASTRA_SCHEDULE = gql`
  query MastraSchedule($_id: String!) {
    mastraSchedule(_id: $_id) {
      ...ScheduleFields
    }
  }
  ${SCHEDULE_FIELDS}
`;

export const MASTRA_WORKFLOW_RUNS = gql`
  query MastraWorkflowRuns($workflowId: String!, $page: Int, $perPage: Int) {
    mastraWorkflowRuns(
      workflowId: $workflowId
      page: $page
      perPage: $perPage
    ) {
      _id
      workflowId
      version
      runId
      status
      triggerEnvelope
      stepsSummary
      output
      error
      usage
      startedAt
      finishedAt
      createdAt
    }
  }
`;
