export const types = `

  type Place {
    name: String
    code: String
    center: JSON
  }

  input PlaceInput {
    name: String
    code: String
    center: JSON
  }

  type Direction @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    placeA: Place
    placeB: Place
    totalDistance: Int
    roadConditions: [String]
    description: String
    duration: Int
  }
`;

export const queries = `
  directions(searchValue: String): [Direction]
  directionDetail(_id: String!): Direction
`;

const params = `
  placeA: PlaceInput!,
  placeB: PlaceInput!,
  totalDistance: Int
  roadConditions: [String]
  description: String
  duration: Int
`;

export const mutations = `
  directionsAdd(${params}): Direction
  directionsEdit(_id: String!, ${params}): Direction
  directionsRemove(_id: String!): JSON
`;
