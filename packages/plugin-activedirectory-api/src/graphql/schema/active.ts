import {
  attachmentType,
  attachmentInput,
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = () => `

  ${attachmentType}
  ${attachmentInput}

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type AD {
    _id: String!
    createdAt: Date
    modifiedAt: Date
    username: String
    email: String
    employeeId: String
  }
`;

const commonFields = `
  username: String
  email: String
  employeeId: String
`;

export const mutations = `
  activeAdd(${commonFields}): AD
`;
