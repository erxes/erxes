export const types = ({ contacts, cards }) => `
type TrackingItem {
  lat: Int
  lng: Int
  trackedDate: Date
}

input TrackingItemInput {
  lat: Int
  lng: Int
  trackedDate: Date
}

  type Trip @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    driverId: String
    carId: String
    dealIds: [String]
    routeId: String
    routeReversed: Boolean
    createdAt : Date
    startedDate: Date
    estimatedCloseDate: Date
    closedDate: Date
    status: String
    statusInfo: [JSON]
    trackingData: [TrackingItem]
    car: Car
    route: Route
    ${
      cards
        ? `
          deals: [Deal]
        `
        : ''
    }

    ${
      contacts
        ? `
        driver: Customer
        `
        : ''
    }

  }
`;

export const queries = `
    trips(status: String): [Trip]
    activeTrips: [Trip]
    tripDetail(_id: String!): Trip
`;

const params = `
    driverId: String,
    carId: String,
    dealIds: [String],
    routeId: String,
    routeReversed: Boolean,
    startedDate: Date,
    closedDate: Date,
    status: String,
    statusInfo: [JSON]
`;

export const mutations = `
    tripsAdd(${params}): Trip
    tripsEdit(_id: String!, ${params}): Trip
    tripsRemove(_id: String!): JSON
    tripsUpdateTrackingData(_id: String!, trackingData: [TrackingItemInput]): Trip
`;
