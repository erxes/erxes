export const types = `
  type DirectionItem {
    directionId: String
    order: Int
  }

  input DirectionItemInput {
    directionId: String
    order: Int
  }

  type Route @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    name: String
    directionItems: [DirectionItem]
    directions: [Direction]
    totalDistance: Int
    totalDuration: Int
  }
`;

export const queries = `
    routes(searchValue: String): [Route]
    routeDetail(_id: String!): Route
`;

const params = `
    name: String!,
    code: String!,
    directionItems: [DirectionItemInput]
`;

export const mutations = `
    routesAdd(${params}): Route
    routesEdit(_id: String!, ${params}): Route
    routesRemove(_id: String!): JSON
`;
