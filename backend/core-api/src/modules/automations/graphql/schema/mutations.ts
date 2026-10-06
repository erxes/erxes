const commonFields = `
  name: String
  status: String
  edgeType: String
  flowDirection: String
  triggers: [TriggerInput],
  actions: [ActionInput],
  workflows: [WorkflowInput]
  notes: [NoteInput]

`;

const aiAgentParams = `
    name:String,
    description:String,
    connection:JSON,
    runtime:JSON,
    context:JSON,
`;

const mutations = `
  automationsAdd(${commonFields}): Automation
  automationsEdit(_id: String, acknowledgeDuplicate: Boolean, ${commonFields}): Automation
  automationsDuplicate(_id: String!, name: String): Automation
  automationsRemove(automationIds: [String]): [String]

  archiveAutomations(automationIds: [String],isRestore:Boolean): [String]

  automationsSaveAsTemplate(_id: String!, name: String, duplicate: Boolean): Automation
  automationsCreateFromTemplate(_id: String): Automation

  automationsAiAgentAdd(${aiAgentParams}):JSON
  automationsAiAgentEdit(_id:String!,${aiAgentParams}):JSON
  automationsAiAgentRemove(_id:String!):JSON
  automationsAiAgentReindex(_id:String!, fileId:String):JSON
  

  automationWorkflowTemplatesAdd(name: String!, description: String, entryActionId: String, actions: JSON, inputs: JSON): AutomationWorkflowTemplate
  automationWorkflowTemplatesEdit(_id: String!, name: String, description: String, entryActionId: String, actions: JSON, inputs: JSON): AutomationWorkflowTemplate
  automationWorkflowTemplatesRemove(_id: String!): JSON
`;

export default mutations;
