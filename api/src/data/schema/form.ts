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
    formFieldId: String
    value: JSON
    formId: String
    submittedAt: Date
  }

  type Submission {
    formId: String
    contentTypeId: String
    customerId: String
    customer: Customer
    createdAt: Date
    submissions: [FormSubmission]
  }

  input SubmissionFilter {
    formFieldId: String
    value: JSON
    operator: String
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
  formSubmissions(tagId: String, formId: String, contentTypeIds: [String], filters: [SubmissionFilter]): [Submission]
`;

export const mutations = `
  formsAdd(${commonFields}): Form
  formsEdit(_id: String!, ${commonFields} ): Form
  formSubmissionsSave(${commonFormSubmissionFields}): Boolean
`;
