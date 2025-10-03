const commonFields = `
  name: String
  status: String
  triggers: [TriggerInput],
  actions: [ActionInput],
`;

const commonNoteFields = `
  automationId: String
  triggerId: String
  actionId: String
  description: String
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
`;

export default mutations;
