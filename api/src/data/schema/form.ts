export const types = `
  type Callout {
    title: String,
    body: String,
    buttonText: String,
    featuredImage: String,
    skip: Boolean
  }

  type Form {
    _id: String!
    title: String
    code: String
    type: String
    description: String
    buttonText: String
    createdUserId: String
    createdUser: User
    createdDate: Date
    numberOfPages: Int

    fields: [Field]
  }

  type FormSubmission {
    _id: String!
    customerId: String
    formId: String
    formFieldId: String
    text: String
    value: JSON
    submittedAt: Date
  }
`;

const commonFields = `
  title: String,
  description: String,
  buttonText: String,
  type: String!,
  numberOfPages: Int
`;

const commonFormSubmissionFields = `
  formId: String,
  contentTypeId: String,
  contentType: String,
  formSubmissions: JSON
`;

export const queries = `
  formDetail(_id: String!): Form
  forms: [Form]
  formSubmissions(formId: String!): [FormSubmission]
`;

export const mutations = `
  formsAdd(${commonFields}): Form
  formsEdit(_id: String!, ${commonFields} ): Form
  formSubmissionsSave(${commonFormSubmissionFields}): Boolean
`;
