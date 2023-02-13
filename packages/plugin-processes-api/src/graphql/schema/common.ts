import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = contactsAvailable => `
  ${attachmentType}
  ${attachmentInput}

  extend type Branch @key(fields: "_id") {
    _id: String! @external
  }

  extend type Department @key(fields: "_id") {
    _id: String! @external
  }

  extend type Product @key(fields: "_id") {
    _id: String! @external
  }

  ${
    contactsAvailable
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


  extend type ProductCategory @key(fields: "_id") {
    _id: String! @external
  }

  extend type Uom @key(fields: "_id") {
    _id: String! @external
  }

  extend type User @key(fields: "_id") {
    _id: String! @external
  }
`;
