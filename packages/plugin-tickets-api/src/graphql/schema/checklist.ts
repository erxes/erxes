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
  ticketChecklistsAdd(contentType: String, contentTypeId: String, title: String): Checklist
  ticketChecklistsEdit(_id: String!, title: String, contentType: String, contentTypeId: String,): Checklist
  ticketChecklistsRemove(_id: String!): Checklist
  ticketChecklistItemsOrder(_id: String!, destinationIndex: Int): ChecklistItem

  ticketChecklistItemsAdd(checklistId: String, content: String, isChecked: Boolean): ChecklistItem
  ticketChecklistItemsEdit(_id: String!, checklistId: String, content: String, isChecked: Boolean): ChecklistItem
  ticketChecklistItemsRemove(_id: String!): ChecklistItem
`;
