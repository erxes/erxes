export const types = `
  type Direction @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    placeIds: [String]
    places: [Place]
    totalDistance: Int
    roadConditions: [String]
    duration: Int
    routeCode: String
    roadCode: String
  }
`;

export const queries = `
  directions(searchValue: String): [Direction]
  directionDetail(_id: String!): Direction
`;

const params = `
  placeIds: [String]!,
  totalDistance: Int,
  roadConditions: [String],
  duration: Int,
  routeCode: String,
  roadCode: String,
`;

export const mutations = `
  directionsAdd(${params}): Direction
  directionsEdit(_id: String!, ${params}): Direction
  directionsRemove(_id: String!): JSON
`;
