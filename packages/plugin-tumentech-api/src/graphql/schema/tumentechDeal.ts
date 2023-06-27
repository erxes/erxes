export const types = ({ cards }) => `

  type TumentechDeal @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    dealId: String
    
    ${cards ? `deal: Deal` : ''}

    startPlaceId: String
    endPlaceId: String
    startPlace: Place
    endPlace: Place
    driverIds: [String]
    requiredCarCategoryIds: [String]
    requiredCarFilter: JSON
    productCategoryId: String
    productSubCategoryId: String
    trackingData: [TrackingItem]
    geometry: String
    tripStartedDate: Date
    tripFinishedData: Date
    estimatedCloseDate: Date
    createdAt: Date
  }


  type TumentechDealsResponse  {
    list: [TumentechDeal],
    totalCount: Int
  }
`;

export const queries = `
    tumentechDeals(page: Int, perPage: Int, dealIds: [String]): TumentechDealsResponse
    tumentechDealDetail(_id: String!): TumentechDeal
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
`;

export const mutations = `
    tumentechDealAdd(${params}): TumentechDeal
    tumentechDealEdit(_id: String!, ${params}): TumentechDeal
    tumentechDealRemove(_id: String!): JSON
`;
