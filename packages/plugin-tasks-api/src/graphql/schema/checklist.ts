export const types = `
  type ChecklistItem {
    _id: String!
    checklistId: String
    isChecked: Boolean
    content: String
    order: Int
  }

  type Checklist {
    _id: String!
    contentType: String
    contentTypeId: String
    title: String
    createdUserId: String
    createdDate: Date
    items: [ChecklistItem]
    percent: Float
  }

`;

export const queries = `
  checklists(contentType: String, contentTypeId: String): [Checklist]
  checklistDetail(_id: String!): Checklist
`;

export const mutations = `
  taskChecklistsAdd(contentType: String, contentTypeId: String, title: String): Checklist
  taskChecklistsEdit(_id: String!, title: String, contentType: String, contentTypeId: String,): Checklist
  taskChecklistsRemove(_id: String!): Checklist
  taskChecklistItemsOrder(_id: String!, destinationIndex: Int): ChecklistItem

  taskChecklistItemsAdd(checklistId: String, content: String, isChecked: Boolean): ChecklistItem
  taskChecklistItemsEdit(_id: String!, checklistId: String, content: String, isChecked: Boolean): ChecklistItem
  taskChecklistItemsRemove(_id: String!): ChecklistItem
`;
