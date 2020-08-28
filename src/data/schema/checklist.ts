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
  checklistsAdd(contentType: String, contentTypeId: String, title: String): Checklist
  checklistsEdit(_id: String!, title: String, contentType: String, contentTypeId: String,): Checklist
  checklistsRemove(_id: String!): Checklist
  checklistItemsOrder(_id: String!, destinationIndex: Int): ChecklistItem

  checklistItemsAdd(checklistId: String, content: String, isChecked: Boolean): ChecklistItem
  checklistItemsEdit(_id: String!, checklistId: String, content: String, isChecked: Boolean): ChecklistItem
  checklistItemsRemove(_id: String!): ChecklistItem
`;
