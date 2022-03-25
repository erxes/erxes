export const types = ({ contacts }) => `
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
    : ""
}

type Ad {
  customerId: String
  loyalty: Float
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

type Submission {
  _id: String!
  contentTypeId: String
  customerId: String
  customer: Customer
  createdAt: Date
  customFieldsData: JSON
  submissions: [FormSubmission]
}

input SubmissionFilter {
  operator: String
  value: JSON
  formFieldId: String
}

input FormSubmissionInput {
  _id: String!
  value: JSON
}
`;

export const queries = `
  formSubmissionsByCustomer(customerId: String!, tagId: String!, filters: [SubmissionFilter], page: Int, perPage: Int): [Submission]
  formSubmissionDetail(contentTypeId: String!): Submission
`;

export const mutations = `
  formSubmissionsRemove(customerId: String!, contentTypeId: String!): JSON
  formSubmissionsEdit(contentTypeId: String!, customerId: String!, submissions: [FormSubmissionInput]): Submission
`;

// type Ad {
//   customerId: String
//   loyalty: Float
// }

// type FormSubmission {
//   _id: String!
//   customerId: String
//   formId: String
//   formFieldId: String
//   text: String
//   formFieldText: String
//   value: JSON
//   submittedAt: Date
// }

// type Submission {
//   _id: String!
//   contentTypeId: String
//   customerId: String
//   customer: Customer
//   createdAt: Date
//   customFieldsData: JSON
//   submissions: [FormSubmission]
// }

// input FormSubmissionInput {
//   _id: String!
//   value: JSON
// }
