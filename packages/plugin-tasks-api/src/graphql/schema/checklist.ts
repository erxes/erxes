export const types = `
  type TasksChecklistItem {
    _id: String!
    checklistId: String
    isChecked: Boolean
    content: String
    order: Int
  }

  type TasksChecklist {
    _id: String!
    contentType: String
    contentTypeId: String
    title: String
    createdUserId: String
    createdDate: Date
    items: [TasksChecklistItem]
    percent: Float
  }

`;

export const queries = `
  tasksChecklists(contentType: String, contentTypeId: String): [TasksChecklist]
  tasksChecklistDetail(_id: String!): TasksChecklist
`;

export const mutations = `
  tasksChecklistsAdd(contentType: String, contentTypeId: String, title: String): TasksChecklist
  tasksChecklistsEdit(_id: String!, title: String, contentType: String, contentTypeId: String,): TasksChecklist
  tasksChecklistsRemove(_id: String!): TasksChecklist
  tasksChecklistItemsOrder(_id: String!, destinationIndex: Int): TasksChecklistItem

  tasksChecklistItemsAdd(checklistId: String, content: String, isChecked: Boolean): TasksChecklistItem
  tasksChecklistItemsEdit(_id: String!, checklistId: String, content: String, isChecked: Boolean): TasksChecklistItem
  tasksChecklistItemsRemove(_id: String!): TasksChecklistItem
`;
