export const types = `
  type PurchaseChecklistItem {
    _id: String!
    checklistId: String
    isChecked: Boolean
    content: String
    order: Int
  }

  type PurchaseChecklist {
    _id: String!
    contentType: String
    contentTypeId: String
    title: String
    createdUserId: String
    createdDate: Date
    items: [PurchaseChecklistItem]
    percent: Float
  }

`;

export const queries = `
  purchaseChecklists(contentType: String, contentTypeId: String): [PurchaseChecklist]
  purchaseChecklistDetail(_id: String!): PurchaseChecklist
`;

export const mutations = `
  purchaseChecklistsAdd(contentType: String, contentTypeId: String, title: String): PurchaseChecklist
  purchaseChecklistsEdit(_id: String!, title: String, contentType: String, contentTypeId: String,): PurchaseChecklist
  purchaseChecklistsRemove(_id: String!): PurchaseChecklist
  purchaseChecklistItemsOrder(_id: String!, destinationIndex: Int): PurchaseChecklistItem

  purchaseChecklistItemsAdd(checklistId: String, content: String, isChecked: Boolean): PurchaseChecklistItem
  purchaseChecklistItemsEdit(_id: String!, checklistId: String, content: String, isChecked: Boolean): PurchaseChecklistItem
  purchaseChecklistItemsRemove(_id: String!): PurchaseChecklistItem
`;
