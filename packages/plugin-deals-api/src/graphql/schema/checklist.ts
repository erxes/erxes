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
  dealChecklistsAdd(contentType: String, contentTypeId: String, title: String): Checklist
  dealChecklistsEdit(_id: String!, title: String, contentType: String, contentTypeId: String,): Checklist
  dealChecklistsRemove(_id: String!): Checklist
  dealChecklistItemsOrder(_id: String!, destinationIndex: Int): ChecklistItem

  dealChecklistItemsAdd(checklistId: String, content: String, isChecked: Boolean): ChecklistItem
  dealChecklistItemsEdit(_id: String!, checklistId: String, content: String, isChecked: Boolean): ChecklistItem
  dealChecklistItemsRemove(_id: String!): ChecklistItem
`;
