export const types = `
  type Place @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    province: String
    name: String
    code: String
    center: JSON
  }

  type PlaceListResponse {
    list: [Place],
    totalCount: Int
  }
`;

export const queries = `
    places(searchValue: String, page: Int, perPage: Int): PlaceListResponse

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
