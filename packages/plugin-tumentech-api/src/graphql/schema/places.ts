export const types = `
  type Place @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    province: String
    name: String
    code: String
    center: JSON
  }
`;

export const queries = `
    places(searchValue: String): [Place]
    placeDetail(_id: String!): Place
`;

const params = `
    province: String!
    name: String!
    code: String!
    center: JSON!
`;

export const mutations = `
    placesAdd(${params}): Place
    placesEdit(_id: String!, ${params}): Place
    placesRemove(_id: String!): JSON
`;
