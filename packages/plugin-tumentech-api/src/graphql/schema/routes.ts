export const types = `

  type Summary {
    totalDistance: Int
    totalDuration: Int
    placeNames: String
  }

  type Route @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    name: String
    code: String
    directionIds: [String]
    directions: [Direction]
    summary : Summary
  }

  type RouteListResponse {
    list: [Route],
    totalCount: Int
  }
`;

export const queries = `
    routes(searchValue: String, page: Int, perPage: Int): RouteListResponse
    routeDetail(_id: String!): Route
`;

const params = `
    name: String!,
    code: String!,
    directionIds: [String]
`;

export const mutations = `
    routesAdd(${params}): Route
    routesEdit(_id: String!, ${params}): Route
    routesRemove(_id: String!): JSON
`;
