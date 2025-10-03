import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
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
  type TourListResponse {
    list: [Tour]
    pageInfo: PageInfo
    totalCount: Int
  }
  type BmsOrderListResponse {
    list: [BmsOrder]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

export const queries = `
  bmsTours(branchId:String, ${GQL_CURSOR_PARAM_DEFS}, status: String, innerDate: Date, tags: [String],startDate1:Date,startDate2:Date,endDate1:Date,endDate2:Date): TourListResponse
  bmsTourDetail(_id:String!,branchId: String): Tour
  bmsOrders( tourId:String, customerId:String ,branchId: String, ${GQL_CURSOR_PARAM_DEFS}):BmsOrderListResponse
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
  bmsTourAdd(${params}): Tour
  bmsTourRemove(ids: [String]): JSON
  bmsTourViewCount(_id: String): JSON
  bmsTourEdit(_id:String!, ${params}): Tour
  bmsOrderAdd(order:BmsOrderInput): BmsOrder
  bmsOrderEdit(_id:String!,order:BmsOrderInput): BmsOrder
  bmsOrderRemove(ids:[String]): JSON
`;
