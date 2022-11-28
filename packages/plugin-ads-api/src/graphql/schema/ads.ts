export const types = ({ contacts, forms }) => `
  ${
    contacts
      ? `
          extend type Customer @key(fields: "_id") {
            _id: String! @external
          }
          `
      : ''
  }

  ${
    forms
      ? `
      extend type Submission @key(fields: "_id") {
        _id: String! @external
      }
      `
      : ''
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

  type AdReview {
    adId: String!
    review: Int 
  }
`;

export const queries = `
  adReview(adId: String!): AdReview
`;

export const mutations = `
  adReviewAdd(adId: String!, review: Int): AdReview
`;
