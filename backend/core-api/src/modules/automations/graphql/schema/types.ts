const commonNodeTypes = `
  id: String
  type: String
  style: JSON
  config: JSON
  icon: String
  label: String
  description: String
  position: JSON
  workflowId: String
`;

const commonTriggerTypes = `
  ${commonNodeTypes}
  actionId: String
  isCustom: Boolean
`;

const commonActionTypes = `
  ${commonNodeTypes}
  nextActionId: String
`;

const workflowTypes = `
  id:String
  automationId:String
  name:String
  description:String
  config:JSON
  position:JSON
`;

const types = `
  type Trigger {
    ${commonTriggerTypes}

    count: Int
  }

  type Action {
    ${commonActionTypes}
  }

  type Workflow {
    ${workflowTypes}
  }

  type Automation {
    _id: String!
    name: String
    status: String
    createdAt: Date
    updatedAt: Date
    createdBy: String
    updatedBy: String
    tagIds:[String]
    triggers: [Trigger]
    actions: [Action]
    workflows: [Workflow]

    createdUser: User
    updatedUser: User

  }

  type AutomationNote {
    _id: String
    description: String
    triggerId: String
    actionId: String
    createdUser: User
    createdAt: Date
  }

  type AutomationsListResponse {
    list: [Automation],
    totalCount: Float,
    pageInfo: PageInfo
  }

  type automationsTotalCountResponse {
    total: Int
    byStatus: Int
  }

  type AutomationHistory {
    _id: String
    createdAt: Date
    modifiedAt: Date
    automationId: String
    triggerId: String
    triggerType: String
    triggerConfig: JSON
    nextActionId: String
    targetId: String
    target: JSON
    status: String
    description: String
    actions: [JSON]
    startWaitingDate: Date
    waitingActionId: String
  }

  type AutomationHistories {
    list:[AutomationHistory]
    totalCount: Int
    pageInfo: PageInfo
  }

  input TriggerInput {
    ${commonTriggerTypes}
  }

  input ActionInput {
    ${commonActionTypes}
  }

  input WorkflowInput {
    ${workflowTypes}
  }

  type TrainingProgress {
    agentId: String!
    totalFiles: Int!
    processedFiles: Int!
    status: String!
    error: String
  }

  type AiAgentMessage {
    message: String!
    relevantFile: String
    similarity: Float
  }
`;

export default types;
