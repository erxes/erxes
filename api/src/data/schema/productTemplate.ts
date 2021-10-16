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
    tagIds: [String]
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

const productTemplateParams = `
  searchValue: String,
  tag: String,
  status: String,
  page: Int,
  perPage: Int
`;

export const queries = `
  productTemplates(${productTemplateParams}): [ProductTemplate]
  productTemplateTotalCount: Int
  productTemplateDetail(_id: String): ProductTemplate
  productTemplateCountByTags: JSON
`;

export const mutations = `
  productTemplatesAdd(${templateParams}): ProductTemplate
  productTemplatesEdit(_id: String!, ${templateParams}): ProductTemplate
  productTemplatesRemove(ids: [String!]): JSON
  productTemplatesChangeStatus(_id: String!, status: String): ProductTemplate
  productTemplatesDuplicate(_id: String!): ProductTemplate
`;
