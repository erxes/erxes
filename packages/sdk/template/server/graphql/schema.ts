// Every root field starts with the extension's plugin name, extTemplate.
export const types = `
  type ExtTemplateNote {
    _id: String!
    text: String!
    createdBy: String!
    createdAt: Date
  }
`;

export const queries = `
  extTemplateNotes: [ExtTemplateNote!]!
`;

export const mutations = `
  extTemplateNotesAdd(text: String!): ExtTemplateNote!
`;
