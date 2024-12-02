import gql from 'graphql-tag';

export const types = () => `
  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  enum STATUS_TOUR {
    running
    compeleted
    scheduled
    cancelled
  }
  type GuideItem {
    guideId: String
    guide: User
    type: String
  }

  type Tour {
    _id: String!
    name: String
    refNumber: String
    content: String
    duration: Int
    location: [BMSLocation]
    guides: [GuideItem]
    itineraryId: String
    itinerary: Itinerary
    startDate: Date
    endDate: Date
    groupSize: Int
    status: String
    cost: Float
    orders: [Order]
    createdAt: Date
    modifiedAt: Date
  }

  type Order {
    _id: String!
    customerId: String
    tourId: String
    amount: Float
    status: String
    note: String
  }
  input OrderInput {
    customerId: String
    tourId: String
    amount: Float
    status: String
    note: String
  }
  input GuideItemInput {
    guideId: String
    type: String
  }
  type ListTour {
    list: [Tour]
    total: Int
  }
  type ListOrder {
    list: [Order]
    total: Int
  }
`;

export const queries = `
  bmTours( page:Int, perPage:Int, status: STATUS_TOUR,innerDate: Date): ListTour
  bmTourDetail(_id:String!): Tour
  bmOrders( tourId:String, customerId:String):ListOrder
`;

const params = `
  name: String,
  content: String,
  itineraryId:String,
  startDate: Date,
  endDate: Date,
  groupSize: Int,
  duration: Int,
  status: STATUS_TOUR,
  cost: Float,
  location: [BMSLocationInput],
  guides:[GuideItemInput],
  refNumber: String
`;

export const mutations = `
  bmTourAdd(${params}): Tour
  bmTourRemove(ids: [String]): JSON
  bmTourEdit(_id:String!, ${params}): Tour
  bmOrderAdd(order:OrderInput): Order
  bmOrderEdit(_id:String!,order:OrderInput): Order
  bmOrderRemove(ids:[String]): JSON
`;