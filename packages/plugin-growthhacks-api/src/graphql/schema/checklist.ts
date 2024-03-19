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
  ghChecklistsAdd(contentType: String, contentTypeId: String, title: String): Checklist
  ghChecklistsEdit(_id: String!, title: String, contentType: String, contentTypeId: String,): Checklist
  ghChecklistsRemove(_id: String!): Checklist
  ghChecklistItemsOrder(_id: String!, destinationIndex: Int): ChecklistItem

  ghChecklistItemsAdd(checklistId: String, content: String, isChecked: Boolean): ChecklistItem
  ghChecklistItemsEdit(_id: String!, checklistId: String, content: String, isChecked: Boolean): ChecklistItem
  ghChecklistItemsRemove(_id: String!): ChecklistItem
`;
