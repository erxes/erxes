export const types = ({ contacts, clientportal }) => `
scalar Date
scalar JSON

extend type User @key(fields: "_id") {
  _id: String! @external
}

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

${
  clientportal
    ? `
extend type ClientPortalUser @key(fields: "_id") {
    _id: String! @external
  }
  `
    : ''
}

enum SortDirection {
  ASC
  DESC
}

enum CacheControlScope {
  PUBLIC
  PRIVATE
}

directive @cacheControl(
  maxAge: Int
  scope: CacheControlScope
  inheritMaxAge: Boolean
) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION
`;
