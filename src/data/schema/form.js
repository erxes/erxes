export const types = `
  type Form {
    _id: String!
    title: String
    code: String
    description: String
    createdUserId: String
    createdDate: Date

    fields: [FormField]
  }

  type FormField {
    _id: String!
    formId: String
    type: String
    validation: String
    text: String
    description: String
    options: [String]
    isRequired: Boolean
    order: Int
  }

  input DicItem {
    id: String!
    order: Int!
  }
`;

export const mutations = `
  formsCreate(
    title: String!,
    description: String,
    createdUserId: String!): Form

  formsUpdate(
    id: String!,
    title: String!,
    description: String): Boolean

  formsRemove(id: String!): Boolean

  formsAddFormField(
    formId: String!,
    type: String!,
    validation: String,
    text: String,
    description: String,
    options: [String],
    isRequired: Boolean): FormField

  formsUpdateFormField(
    id: String!,
    type: String!,
    validation: String,
    text: String,
    description: String,
    options: [String],
    isRequired: Boolean): Boolean

  formsRemoveFormField(id: String!): Boolean

  formsUpdateFormFieldsOrder(orderDics: [DicItem]): Boolean

  formsDuplicate(id: String!): Form
`;

export const queries = `
  forms(limit: Int): [Form]
  formDetail(_id: String!): Form
  formsTotalCount: Int
`;
