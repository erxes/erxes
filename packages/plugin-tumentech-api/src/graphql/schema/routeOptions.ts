export const types = `
  type Route {
    staticRouteId: String
    order: Int
  }

  input RouteInput {
    staticRouteId: String
    order: Int
  }

  type RouteOption @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    name: String
    routes: [Route]
    staticRoutes: [StaticRoute]
    totalDistance: Int
    totalDirtRoadLength: Int
    totalAsphaltRoadLength: Int
  }
`;

export const queries = `
    routeOptions(searchValue: String): [RouteOption]
    routeOptionDetail(_id: String!): RouteOption
`;

const params = `
    name: String!,
    routes: [RouteInput],
`;

export const mutations = `
    routeOptionsAdd(${params}): RouteOption
    routeOptionsEdit(_id: String!, ${params}): RouteOption
    routeOptionsRemove(_id: String!): JSON
`;
