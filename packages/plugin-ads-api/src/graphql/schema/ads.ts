export const types = ({ contacts, forms }) => `
  ${
    contacts
      ? `
          extend type Customer @key(fields: "_id") {
            _id: String! @external
          }
          `
      : ""
  }

  ${
    forms
      ? `
      extend type Submission @key(fields: "_id") {
        _id: String! @external
      }
      `
      : ""
  }

  input SubmissionFilter {
    operator: String
    value: JSON
    formFieldId: String
  }

  type Ad {
    customerId: String
    loyalty: Float
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
