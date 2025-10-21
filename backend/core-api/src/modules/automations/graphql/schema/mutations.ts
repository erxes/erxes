const commonFields = `
  name: String
  status: String
  triggers: [TriggerInput],
  actions: [ActionInput],
  workflows: [WorkflowInput]

`;

const commonNoteFields = `
  automationId: String
  triggerId: String
  actionId: String
  description: String
`;

const aiAgentParams = `
    name:String,
    description:String,
    provider:String,
    prompt:String,
    instructions:String,
    files:JSON,
    config:JSON,
`;

const mutations = `
  automationsAdd(${commonFields}): Automation
  automationsEdit(_id: String, ${commonFields}): Automation
  automationsRemove(automationIds: [String]): [String]
  archiveAutomations(automationIds: [String],isRestore:Boolean): [String]

  automationsSaveAsTemplate(_id: String!, name: String, duplicate: Boolean): Automation
  automationsCreateFromTemplate(_id: String): Automation

  automationsAddNote(${commonNoteFields}): AutomationNote
  automationsEditNote(_id: String!, ${commonNoteFields}): AutomationNote
  automationsRemoveNote(_id: String!): AutomationNote
  automationsAiAgentAdd(${aiAgentParams}):JSON
  automationsAiAgentEdit(_id:String!,${aiAgentParams}):JSON
  startAiTraining(agentId: String!): TrainingProgress!
  getTrainingStatus(agentId: String!): TrainingProgress!
  generateAgentMessage(agentId: String!, prevQuestions:[String],question: String!): AiAgentMessage!
`;

export default mutations;
