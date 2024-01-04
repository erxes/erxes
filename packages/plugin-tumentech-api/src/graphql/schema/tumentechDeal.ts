export const types = ({ cards }) => `

type TrackingItem {
  lat: Float
  lng: Float
  trackedDate: Date
}

type TrackingData {
  carId: String
  car: Car
  dealId: String
  list: [TrackingItem]
}

input TrackingItemInput {
  lat: Float
  lng: Float
  trackedDate: Date
}

  type TumentechDeal @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    dealId: String
    
    ${cards ? `deal: Deal` : ''}

    driverType: Int
    startPlaceId: String
    endPlaceId: String
    startPlace: Place
    endPlace: Place
    driverIds: [String]
    requiredCarCategoryIds: [String]
    requiredCarFilter: JSON
    productCategoryId: String
    productSubCategoryId: String
    trackingData: [TrackingData]
    geometry: String
    tripDistance: Float
    tripStartedDate: Date
    tripFinishedData: Date
    estimatedCloseDate: Date
    createdAt: Date
    createdBy: String
    warehouseUserIdToLoad: String
    warehouseUserIdToUnload: String
    warehouseUserToLoad: Customer
    warehouseUserToUnload: Customer
  }


  type TumentechDealsResponse  {
    list: [TumentechDeal],
    totalCount: Int
  }
`;

export const queries = `
tumentechDeals(page: Int, perPage: Int, dealIds: [String],stageId: String, driverType: Int, pipelineId: String, isFilterCreatedBy: Boolean,startPlaceId:String,endPlaceId:String,productCategoryId:String,productSubCategoryId:String,requiredCarCategoryIds:[String]): TumentechDealsResponse    tumentechDealDetail(_id: String, dealId: String, isFilterCreatedBy: Boolean): TumentechDeal

    tumentechTrackingDatas(dealId: String!): [TrackingData]
    tumentechTrackingData(carId: String!, dealId: String!): TrackingData
`;

const params = `
    dealId: String,
    startPlaceId: String,
    endPlaceId: String,
    driverIds: [String],
    requiredCarCategoryIds: [String],
    requiredCarFilter: JSON,
    productCategoryId: String,
    productSubCategoryId: String,
    trackingData: [TrackingItemInput],
    tripStartedDate: Date,
    tripFinishedData: Date,
    warehouseUserIdToLoad: String,
    warehouseUserIdToUnload: String,
`;

export const mutations = `
    tumentechDealAdd(${params}): TumentechDeal
    tumentechDealEdit(_id: String!, ${params}): TumentechDeal
    tumentechDealRemove(_id: String!): JSON

    tumentechDealAddTrackingData(dealId: String!, carId:String!, trackingData: [TrackingItemInput]): TumentechDeal
`;
