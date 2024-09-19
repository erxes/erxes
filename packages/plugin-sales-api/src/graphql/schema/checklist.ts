export const types = `
  type SalesChecklistItem {
    _id: String!
    checklistId: String
    isChecked: Boolean
    content: String
    order: Int
  }

  type SalesChecklist {
    _id: String!
    contentType: String
    contentTypeId: String
    title: String
    createdUserId: String
    createdDate: Date
    items: [SalesChecklistItem]
    percent: Float
  }

`;

export const queries = `
  salesChecklists(contentType: String, contentTypeId: String): [SalesChecklist]
  salesChecklistDetail(_id: String!): SalesChecklist
`;

export const mutations = `
  salesChecklistsAdd(contentType: String, contentTypeId: String, title: String): SalesChecklist
  salesChecklistsEdit(_id: String!, title: String, contentType: String, contentTypeId: String,): SalesChecklist
  salesChecklistsRemove(_id: String!): SalesChecklist
  salesChecklistItemsOrder(_id: String!, destinationIndex: Int): SalesChecklistItem

  salesChecklistItemsAdd(checklistId: String, content: String, isChecked: Boolean): SalesChecklistItem
  salesChecklistItemsEdit(_id: String!, checklistId: String, content: String, isChecked: Boolean): SalesChecklistItem
  salesChecklistItemsRemove(_id: String!): SalesChecklistItem
`;
