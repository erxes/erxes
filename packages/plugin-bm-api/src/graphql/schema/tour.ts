import gql from 'graphql-tag';

export const types = () => `
  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type GuideItem {
    guideId: String
    guide: User
    type: String
  }

  type Tour {
    _id: String!
    branchId: String
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
    orders: [BmsOrder]
    createdAt: Date
    modifiedAt: Date
    viewCount: Int
    tags: [String]
    info1: String
    info2: String
    info3: String
    info4: String
    extra: JSON
    images: [String]
    imageThumbnail: String
  }

  type BmsOrder {
    _id: String!
    branchId: String
    customerId: String
    tourId: String
    amount: Float
    status: String
    note: String
    numberOfPeople: Int
    type: String
    additionalCustomers: String
  }

  input BmsOrderInput {
    branchId: String
    customerId: String
    tourId: String
    amount: Float
    status: String
    note: String
    numberOfPeople: Int
    type: String
    additionalCustomers: String
  }
  input GuideItemInput {
    guideId: String
    type: String
  }
  type ListTour {
    list: [Tour]
    total: Int
  }
  type ListBmsOrder {
    list: [BmsOrder]
    total: Int
  }
`;

export const queries = `
  bmTours( page:Int, perPage:Int, status: String, innerDate: Date,branchId: String, tags: [String],startDate1:Date,startDate2:Date,endDate1:Date,endDate2:Date): ListTour
  bmTourDetail(_id:String!,branchId: String): Tour
  bmOrders( tourId:String, customerId:String ,branchId: String):ListBmsOrder
`;

const params = `
  branchId: String,
  name: String,
  content: String,
  itineraryId:String,
  startDate: Date,
  endDate: Date,
  groupSize: Int,
  duration: Int,
  status: String,
  cost: Float,
  location: [BMSLocationInput],
  guides:[GuideItemInput],
  refNumber: String,
  tags:[String],
  viewCount: Int,
  info1: String,
  info2: String,
  info3: String,
  info4: String,
  extra: JSON,
  images: [String],
  imageThumbnail: String
`;

export const mutations = `
  bmTourAdd(${params}): Tour
  bmTourRemove(ids: [String]): JSON
  bmTourViewCount(_id: String): JSON
  bmTourEdit(_id:String!, ${params}): Tour
  bmOrderAdd(order:BmsOrderInput): BmsOrder
  bmOrderEdit(_id:String!,order:BmsOrderInput): BmsOrder
  bmOrderRemove(ids:[String]): JSON
`;
