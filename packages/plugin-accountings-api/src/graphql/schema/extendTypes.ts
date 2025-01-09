import {
  attachmentInput,
  attachmentType
} from '@erxes/api-utils/src/commonTypeDefs';

const extendTypes = `
  ${attachmentType}
  ${attachmentInput}

  extend type Branch @key(fields: "_id") {
    _id: String! @external
  }

  extend type Department @key(fields: "_id") {
    _id: String! @external
  }

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  extend type Product @key(fields: "_id") {
    _id: String! @external
  }

  extend type ProductCategory @key(fields: "_id") {
    _id: String! @external
  }

  extend type Uom @key(fields: "_id") {
    _id: String! @external
  }

  type AccCustomer {
    _id: String!
    code: String
    primaryPhone: String
    firstName: String
    primaryEmail: String
    lastName: String
  }
`;

export default extendTypes;
