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
  purchaseChecklists(contentType: String, contentTypeId: String): [Checklist]
  purchaseChecklistDetail(_id: String!): Checklist
`;

export const mutations = `
  purchaseChecklistsAdd(contentType: String, contentTypeId: String, title: String): Checklist
  purchaseChecklistsEdit(_id: String!, title: String, contentType: String, contentTypeId: String,): Checklist
  purchaseChecklistsRemove(_id: String!): Checklist
  purchaseChecklistItemsOrder(_id: String!, destinationIndex: Int): ChecklistItem

  purchaseChecklistItemsAdd(checklistId: String, content: String, isChecked: Boolean): ChecklistItem
  purchaseChecklistItemsEdit(_id: String!, checklistId: String, content: String, isChecked: Boolean): ChecklistItem
  purchaseChecklistItemsRemove(_id: String!): ChecklistItem
`;
