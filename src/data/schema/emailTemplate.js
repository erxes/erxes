export const types = `
  type EmailTemplate {
    _id: String!
    name: String
    content: String
  }
`;

export const queries = `
  emailTemplates(limit: Int): [EmailTemplate]
  totalEmailTemplatesCount: Int
`;
