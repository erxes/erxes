export const types = `
  type Direction @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    locationA: String
    locationB: String
    totalDistance: Int
    dirtRoadLength: Int
    asphaltRoadLength: Int
    description: String
    duration: Int
  }
`;

export const queries = `
  directions(searchValue: String): [Direction]
  directionDetail(_id: String!): Direction
`;

const params = `
  locationA: String!,
  locationB: String!,
  totalDistance: Int!,
  dirtRoadLength: Int,
  asphaltRoadLength: Int,
  description: String,
  duration: Int!
`;

export const mutations = `
  directionsAdd(${params}): Direction
  directionsEdit(_id: String!, ${params}): Direction
  directionsRemove(_id: String!): JSON
`;
