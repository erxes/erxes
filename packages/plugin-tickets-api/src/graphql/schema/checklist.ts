export const types = `
  type TicketsChecklistItem {
    _id: String!
    checklistId: String
    isChecked: Boolean
    content: String
    order: Int
  }

  type TicketsChecklist {
    _id: String!
    contentType: String
    contentTypeId: String
    title: String
    createdUserId: String
    createdDate: Date
    items: [TicketsChecklistItem]
    percent: Float
  }

`;

export const queries = `
  ticketsChecklists(contentType: String, contentTypeId: String): [TicketsChecklist]
  ticketsChecklistDetail(_id: String!): TicketsChecklist
`;

export const mutations = `
  ticketsChecklistsAdd(contentType: String, contentTypeId: String, title: String): TicketsChecklist
  ticketsChecklistsEdit(_id: String!, title: String, contentType: String, contentTypeId: String,): TicketsChecklist
  ticketsChecklistsRemove(_id: String!): TicketsChecklist
  ticketsChecklistItemsOrder(_id: String!, destinationIndex: Int): TicketsChecklistItem

  ticketsChecklistItemsAdd(checklistId: String, content: String, isChecked: Boolean): TicketsChecklistItem
  ticketsChecklistItemsEdit(_id: String!, checklistId: String, content: String, isChecked: Boolean): TicketsChecklistItem
  ticketsChecklistItemsRemove(_id: String!): TicketsChecklistItem
`;
