export const types = `
  type PurchasesChecklistItem {
    _id: String!
    checklistId: String
    isChecked: Boolean
    content: String
    order: Int
  }

  type PurchasesChecklist {
    _id: String!
    contentType: String
    contentTypeId: String
    title: String
    createdUserId: String
    createdDate: Date
    items: [PurchasesChecklistItem]
    percent: Float
  }

`;

export const queries = `
  purchasesChecklists(contentType: String, contentTypeId: String): [PurchasesChecklist]
  purchasesChecklistDetail(_id: String!): PurchasesChecklist
`;

export const mutations = `
  purchasesChecklistsAdd(contentType: String, contentTypeId: String, title: String): PurchasesChecklist
  purchasesChecklistsEdit(_id: String!, title: String, contentType: String, contentTypeId: String,): PurchasesChecklist
  purchasesChecklistsRemove(_id: String!): PurchasesChecklist
  purchasesChecklistItemsOrder(_id: String!, destinationIndex: Int): PurchasesChecklistItem

  purchasesChecklistItemsAdd(checklistId: String, content: String, isChecked: Boolean): PurchasesChecklistItem
  purchasesChecklistItemsEdit(_id: String!, checklistId: String, content: String, isChecked: Boolean): PurchasesChecklistItem
  purchasesChecklistItemsRemove(_id: String!): PurchasesChecklistItem
`;
