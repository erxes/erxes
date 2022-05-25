export const types = `
  type StaticRoute @key(fields: "_id") @cacheControl(maxAge: 3) {
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
  staticRoutes(searchValue: String): [StaticRoute]
  staticRouteDetail(_id: String!): StaticRoute
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
    staticRoutesAdd(${params}): StaticRoute
    staticRoutesEdit(_id: String!, ${params}): StaticRoute
    staticRoutesRemove(_id: String!): JSON
`;
