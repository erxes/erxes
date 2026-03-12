import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type GuideItem {
    guideId: String
    guide: User
    type: String
  }
  type TourCategory {
    _id: String!
    name: String
    parentId: String
  }
  enum DATE_STATUS {
    running
    completed
    scheduled
    cancelled
    unscheduled
  }
  type Tour {
    _id: String!
    branchId: String
    name: String
    refNumber: String
    groupCode: String
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
    date_status: DATE_STATUS
    cost: Float
    orders: [BmsOrder]
    createdAt: Date
    modifiedAt: Date
    viewCount: Int
    advanceCheck: Boolean
    advancePercent: Float
    joinPercent: Float
    categories: [String]
    categoriesObject: [TourCategory]
    tagIds: [String]
    info1: String
    info2: String
    info3: String
    info4: String
    info5: String
    personCost: JSON
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
    additionalCustomers: [String]
    isChild: Boolean
    parent: String   
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
    additionalCustomers: [String]
    isChild: Boolean
    parent: String
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
  type GroupTourItem {
    items:[Tour]
    _id: String
  }
  type GroupTour {
    list:[GroupTourItem]
    total: Int
  }
`;

export const queries = `
  bmsTours(branchId:String, categories: [String], name: String, ${GQL_CURSOR_PARAM_DEFS}, status: String, innerDate: Date, tags: [String],startDate1:Date,startDate2:Date,endDate1:Date,endDate2:Date,  date_status: DATE_STATUS): TourListResponse
  bmsTourDetail(_id:String!,branchId: String): Tour
  bmsTourCategories(parentId:String): [TourCategory]
  bmsOrders( tourId:String, customerId:String ,branchId: String, ${GQL_CURSOR_PARAM_DEFS}):BmsOrderListResponse
  bmToursGroup(branchId:String, categories: [String], name: String, ${GQL_CURSOR_PARAM_DEFS}, status: String, innerDate: Date,tags: [String],startDate1:Date,startDate2:Date,endDate1:Date,endDate2:Date,date_status: DATE_STATUS): GroupTour
  bmToursGroupDetail(groupCode:String,status: String): GroupTourItem

  cpBmsTours(branchId:String, categories: [String], name: String, ${GQL_CURSOR_PARAM_DEFS}, status: String, innerDate: Date, tags: [String],startDate1:Date,startDate2:Date,endDate1:Date,endDate2:Date,  date_status: DATE_STATUS, webId: String): TourListResponse
  cpBmsTourDetail(_id:String!,branchId: String): Tour
  cpBmToursGroup(branchId:String, categories: [String], name: String, ${GQL_CURSOR_PARAM_DEFS}, status: String, innerDate: Date,tags: [String],startDate1:Date,startDate2:Date,endDate1:Date,endDate2:Date,date_status: DATE_STATUS, webId: String): GroupTour
  cpBmToursGroupDetail(groupCode:String,status: String): GroupTourItem
`;

const params = `
  branchId: String,
  name: String,
  groupCode: String,
  content: String,
  itineraryId:String,
  startDate: Date,
  endDate: Date,
  groupSize: Int,
  duration: Int,
  advancePercent: Float,
  joinPercent: Float,
  advanceCheck: Boolean,
  status: String,
  date_status: DATE_STATUS!
  cost: Float,
  location: [BMSLocationInput],
  guides:[GuideItemInput],
  categories:[String],
  refNumber: String,
  tagIds:[String],
  viewCount: Int,
  info1: String,
  info2: String,
  info3: String,
  info4: String,
  info5: String,
  personCost: JSON,
  extra: JSON,
  images: [String],
  imageThumbnail: String
`;

export const mutations = `
  bmsTourAdd(${params}): Tour
  bmsTourRemove(ids: [String]): JSON
  bmsTourViewCount(_id: String): JSON
  bmsTourEdit(_id:String!, ${params}): Tour
  bmsTourCategoryAdd(name:String,parentId:String):TourCategory
  bmsTourCategoryRemove(_id: String!):JSON
  bmsTourCategoryEdit(_id: String!, name:String,parentId:String): TourCategory
  bmsOrderAdd(order:BmsOrderInput): BmsOrder
  bmsOrderEdit(_id:String!,order:BmsOrderInput): BmsOrder
  bmsOrderRemove(ids:[String]): JSON
`;
