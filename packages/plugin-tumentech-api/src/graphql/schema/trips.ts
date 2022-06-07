// driverId: string;
// carId: string;
// dealIds: string[];
// routeId: string;
// routeReversed: boolean;
// createdAt: Date;
// startedDate: Date;
// estimatedCloseDate: Date;
// closedDate: Date;
// status: string;
// statusDates: [{ [key: string]: Date }];
// trackingHistory: [[number, number, number]];

export const types = `

  

  type Trip @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    carId: String
    dealIds: {String}
    routeId: String
    routeReversed: Boolean
    createdAt : Date
    startedDate: Date
    estimatedCloseDate: Date
    closedDate: Date
    status: string;
    statusInfo: [JSON]
    trackingHistory: [JSON]
  }
`;

export const queries = `
    routes(searchValue: String): [Route]
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
