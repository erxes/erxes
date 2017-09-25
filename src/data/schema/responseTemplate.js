export const types = `
  type ResponseTemplate {
    _id: String!
    name: String
    content: String
    brandId: String
    brand: Brand,
    files: JSON
  }
`;

export const queries = `
  responseTemplates(limit: Int): [ResponseTemplate]
  totalResponseTemplatesCount: Int
`;
