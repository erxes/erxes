import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

const queryParams = `
  page: Int
  perPage: Int
  ids: [String]
  excludeIds: [String]
  searchValue: String
  sortField: String
  sortDirection: Int
  status: String
  tagIds:[String]
`;

const historiesParams = `
  automationId: String!,
  page: Int,
  perPage: Int,
  status: String,
  triggerId: String,
  triggerType: String,
  beginDate: Date,
  endDate: Date,
  targetId: String
  targetIds: [String]
  triggerTypes: [String]
  ids:[String]
`;

const queries = `
  automationsMain(${queryParams}): AutomationsListResponse
  automations(${queryParams}): [Automation]
  automationDetail(_id: String!): Automation
  automationNotes(automationId: String!, triggerId: String, actionId: String): [AutomationNote]
  automationHistories(${GQL_CURSOR_PARAM_DEFS},${historiesParams}): AutomationHistories
  automationHistoriesTotalCount(${historiesParams}):Int
  automationsTotalCount(status: String): automationsTotalCountResponse
  automationConstants: JSON
  automationBotsConstants:JSON
  automationsAiAgents(kind:String):JSON
  automationsAiAgentDetail:JSON
  getTrainingStatus(agentId: String!): TrainingProgress!
  getAutomationWebhookEndpoint(_id:String!):String
`;

export default queries;
