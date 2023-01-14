export const types = ({ contacts, cards }) => `
type TrackingItem {
  lat: Float
  lng: Float
  trackedDate: Date
}

input TrackingItemInput {
  lat: Float
  lng: Float
  trackedDate: Date
}

type TumentechDeal {
  deal: Deal
  dealPlace: DealPlace
}

input LocationInput {
  lat: Float
  lng: Float
}

  type Trip @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    driverId: String
    carIds: [String]
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
    cars: [Car]
    route: Route
    ${
      cards
        ? `
          deals(customerId: String): [TumentechDeal]
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

  type TripListResponse {
    list: [Trip],
    totalCount: Int
  }

  enum DateFilterType {
    createdAt
    ShipmentTime
  }
`;

export const queries = `
    trips(status: String, customerId: String, driverId: String, dealId: String, page: Int, perPage: Int): TripListResponse
    activeTrips: [Trip]
    tripDetail(_id: String!): Trip
    tripByDealId(dealId: String! customerId: String): Trip

    matchingDeals(routeId:String, carId: String, categoryIds: [String], currentLocation:LocationInput, searchRadius: Int ,date: String, dateType: DateFilterType): [Deal]
`;

const params = `
    driverId: String,
    carIds: [String],
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
