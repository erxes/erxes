export const types = `
  type ProductTemplateItem {
    categoryId: Category
    item: Product
    unitPrice: String
    quantity: String
    discount: String
  }

  type ProductTemplate {
    _id: String!
    type: String
    title: String
    discount: String
    totalAmount: String
    description: String
    templateItems: [ProductTemplateItem]
    status: String
    tags: [Tag]
    updatedAt: Date
    updatedBy: User
    createdAt: Date
    createdBy: User
    textValue: String
  }
`;

const templateParams = `
  type: String
  title: String
  discount: String
  totalAmount: String
  description: String
  templateItems: [String]
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
