export const types = `
  type ProductTemplate {
    _id: String!
    type: String
    title: String
    discount: Int
    totalAmount: Int
    description: String
    templateItems: JSON
    status: String
    tags: [Tag]
    updatedAt: Date
    updatedBy: String
    createdAt: Date
    createdBy: String
    textValue: String
  }
`;

const templateParams = `
  type: String
  title: String
  discount: Int
  totalAmount: Int
  description: String
  templateItems: JSON
  status: String
`;

export const queries = `
  productTemplates: [ProductTemplate]
  productTemplateTotalCount: Int
  productTemplateDetail(_id: String): ProductTemplate
`;

export const mutations = `
  productTemplatesAdd(${templateParams}): ProductTemplate
  productTemplatesEdit(_id: String!, ${templateParams}): ProductTemplate
  productTemplatesRemove(ids: [String!]): String
`;
