export const types = ({ contacts }) => `

  ${SubmissionFilter}

  ${
    contacts
      ? `
        extend type Customer @key(fields: "_id") {
          _id: String! @external
        }

        extend type Company @key(fields: "_id") {
          _id: String! @external
        }
        `
      : ''
  }


  type Callout {
    title: String,
    body: String,
    buttonText: String,
    featuredImage: String,
    skip: Boolean
  }

  type Form @key(fields: "_id") {
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

    googleMapApiKey: String
    fields: [Field]
  }

  type FormSubmission {
    _id: String!
    customerId: String
    formId: String
    formFieldId: String
    text: String
    formFieldText: String
    value: JSON
    submittedAt: Date
  }

  type Submission @key(fields: "_id") {
    _id: String!
    contentTypeId: String
    customerId: String

    ${
      contacts
        ? `
        customer: Customer
      `
        : ''
    }
    createdAt: Date
    customFieldsData:JSON
    submissions: [FormSubmission]
  }
`;

export const SubmissionFilter = `input SubmissionFilter {
  operator: String
  value: JSON
  formFieldId: String
}`;

const commonFields = `
  title: String,
  description: String,
  buttonText: String,
  type: String!,
  numberOfPages: Int,
  googleMapApiKey: String
`;

const commonFormSubmissionFields = `
  formId: String,
  contentTypeId: String,
  contentType: String,
  formSubmissions: JSON
`;

const formSubmissionQueryParams = `
tagId: String, 
formId: String, 
filters: [SubmissionFilter]
`;

export const queries = `
  formDetail(_id: String!): Form
  forms: [Form]
  formSubmissions(${formSubmissionQueryParams}, page: Int, perPage: Int): [Submission]
  formSubmissionsTotalCount(${formSubmissionQueryParams}): Int
`;

export const mutations = `
  formsAdd(${commonFields}): Form
  formsEdit(_id: String!, ${commonFields} ): Form
  formSubmissionsSave(${commonFormSubmissionFields}): Boolean
`;
