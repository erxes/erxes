import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type GuideItem {
    guideId: String
    guide: User
    type: String
  }

  type TourCategoryTranslation {
    _id: String!
    objectId: String!
    language: String!
    name: String
    createdAt: Date
    updatedAt: Date
  }

  type TourCategory {
    _id: String!
    name: String
    code: String
    order: String
    parentId: String
    branchId: String
    attachment: Attachment
    tourCount: Int
    language: String
    createdAt: Date
    modifiedAt: Date
    translations(language: String): [TourCategoryTranslation]
  }

  enum DATE_STATUS {
    running
    completed
    scheduled
    cancelled
    unscheduled
  }
  enum DATE_TYPE {
    fixed
    flexible
  }
  type PricingOptionPrice {
    type: String!
    price: Float!
  }
  type PricingOption {
    _id: ID!
    title: String!
    minPersons: Int!
    maxPersons: Int
    prices: [PricingOptionPrice]
    pricePerPerson: Float!
    accommodationType: String
    domesticFlightPerPerson: Float
    singleSupplement: Float
    note: String
  }

  type PricingOptionTranslation {
    optionId: String!
    title: String
    note: String
    accommodationType: String
    prices: [PricingOptionPrice]
    pricePerPerson: Float
    domesticFlightPerPerson: Float
    singleSupplement: Float
  }

  type TourTranslation {
    _id: String!
    objectId: String!
    language: String!
    name: String
    refNumber: String
    content: String
    info1: String
    info2: String
    info3: String
    info4: String
    info5: String
    pricingOptions: [PricingOptionTranslation]
    createdAt: Date
    updatedAt: Date
  }

  input PricingOptionTranslationInput {
    optionId: String!
    title: String
    note: String
    accommodationType: String
    prices: [PricingOptionPriceInput]
    pricePerPerson: Float
    domesticFlightPerPerson: Float
    singleSupplement: Float
  }

  input TourTranslationInput {
    objectId: String
    language: String!
    name: String
    refNumber: String
    content: String
    info1: String
    info2: String
    info3: String
    info4: String
    info5: String
    pricingOptions: [PricingOptionTranslationInput]
  }

  input TourCategoryTranslationInput {
    objectId: String
    language: String!
    name: String
  }

  type Tour {
    _id: String!
    branchId: String
    language: String
    name: String
    refNumber: String
    groupCode: String
    content: String
    duration: Int
    location: [BMSLocation]
    guides: [GuideItem]
    itineraryId: String
    itinerary: Itinerary
    dateType: DATE_TYPE
    startDate: Date
    endDate: Date
    availableFrom: Date
    availableTo: Date
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
    categoriesObject: [TourCategory]
    tagIds: [String]
    categoryIds: [String]
    info1: String
    info2: String
    info3: String
    info4: String
    info5: String
    personCost: JSON
    extra: JSON
    images: [String]
    imageThumbnail: String
    attachment: Attachment
    pricingOptions: [PricingOption]
    startingPrice: Float
    translations(language: String): [TourTranslation]
  }

  type BmsOrder {
    _id: String!
    branchId: String
    customerId: String
    tourId: String
    amount: Float
    status: String
    note: String
    internalNote: String
    numberOfPeople: Int
    type: String
    additionalCustomers: [String]
    isChild: Boolean
    parent: String
    createdAt: Date
  }

  input BmsOrderInput {
    branchId: String
    customerId: String
    tourId: String
    amount: Float
    status: String
    note: String
    internalNote: String
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
  input PricingOptionPriceInput {
    type: String!
    price: Float!
  }
  input PricingOptionInput {
    _id: ID
    title: String!
    minPersons: Int!
    maxPersons: Int
    prices: [PricingOptionPriceInput]
    pricePerPerson: Float
    accommodationType: String
    domesticFlightPerPerson: Float
    singleSupplement: Float
    note: String
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
    items: [Tour]
    _id: String
    name: String
  }
  type GroupTour {
    list: [GroupTourItem]
    total: Int
  }
`;

export const queries = `
  bmsTours(branchId: String, categoryIds: [String], name: String, ${GQL_CURSOR_PARAM_DEFS}, status: String, innerDate: Date, tags: [String], startDate1: Date, startDate2: Date, endDate1: Date, endDate2: Date, date_status: DATE_STATUS, language: String): TourListResponse
  bmsToursTotalCount(branchId: String): Int
  bmsTourDetail(_id: String!, branchId: String, language: String): Tour
  bmsTourCategories(parentId: String, name: String, branchId: String, language: String): [TourCategory]
  bmsOrders(tourId: String, customerId: String, branchId: String, ${GQL_CURSOR_PARAM_DEFS}): BmsOrderListResponse
  bmsOrderDetail(_id: String!): BmsOrder
  bmsOrderCustomerIds(tourId: String!): [String]
  bmToursGroup(branchId: String, categoryIds: [String], name: String, ${GQL_CURSOR_PARAM_DEFS}, status: String, innerDate: Date, tags: [String], startDate1: Date, startDate2: Date, endDate1: Date, endDate2: Date, date_status: DATE_STATUS, language: String): GroupTour
  bmToursGroupDetail(groupCode: String, status: String, language: String): GroupTourItem

  cpBmsTourCategories(parentId: String, name: String, branchId: String, language: String): [TourCategory]
  cpBmsTours(branchId: String, categoryIds: [String], name: String, ${GQL_CURSOR_PARAM_DEFS}, status: String, innerDate: Date, tags: [String], startDate1: Date, startDate2: Date, endDate1: Date, endDate2: Date, date_status: DATE_STATUS, webId: String, language: String): TourListResponse
  cpBmsToursTotalCount(branchId: String, webId: String): Int
  cpBmsTourDetail(_id: String!, branchId: String, language: String): Tour
  cpBmToursGroup(branchId: String, categoryIds: [String], name: String, ${GQL_CURSOR_PARAM_DEFS}, status: String, innerDate: Date, tags: [String], startDate1: Date, startDate2: Date, endDate1: Date, endDate2: Date, date_status: DATE_STATUS, webId: String, language: String): GroupTour
  cpBmToursGroupDetail(groupCode: String, status: String, language: String): GroupTourItem
  cpBmsOrders(tourId: String, customerId: String, branchId: String, ${GQL_CURSOR_PARAM_DEFS}): BmsOrderListResponse
`;

const categoryParams = `
  name: String
  code: String
  parentId: String
  branchId: String
  attachment: AttachmentInput
  language: String
  translations: [TourCategoryTranslationInput]
`;

const params = `
  branchId: String,
  language: String,
  name: String,
  groupCode: String,
  content: String,
  itineraryId: String,
  dateType: DATE_TYPE,
  startDate: Date,
  endDate: Date,
  availableFrom: Date,
  availableTo: Date,
  groupSize: Int,
  duration: Int,
  advancePercent: Float,
  joinPercent: Float,
  advanceCheck: Boolean,
  status: String,
  date_status: DATE_STATUS!
  cost: Float,
  location: [BMSLocationInput],
  guides: [GuideItemInput],
  refNumber: String,
  tagIds: [String],
  categoryIds: [String],
  viewCount: Int,
  info1: String,
  info2: String,
  info3: String,
  info4: String,
  info5: String,
  personCost: JSON,
  extra: JSON,
  images: [String],
  imageThumbnail: String,
  attachment: AttachmentInput,
  pricingOptions: [PricingOptionInput],
  translations: [TourTranslationInput]
`;

export const mutations = `
  bmsTourAdd(${params}): Tour
  bmsTourRemove(ids: [String]): JSON
  bmsTourViewCount(_id: String): JSON
  bmsTourEdit(_id: String!, ${params}): Tour

  bmsTourCategoryAdd(${categoryParams}): TourCategory
  bmsTourCategoryRemove(_id: String, ids: [String]): JSON
  bmsTourCategoryEdit(_id: String!, ${categoryParams}): TourCategory
  bmsTourCategoryTranslationUpsert(input: TourCategoryTranslationInput!): TourCategoryTranslation
  bmsTourCategoryTranslationDelete(_id: String!): JSON

  bmsOrderAdd(order: BmsOrderInput): BmsOrder
  bmsOrderEdit(_id: String!, order: BmsOrderInput): BmsOrder
  bmsOrderRemove(ids: [String]): JSON

  cpBmsOrderAdd(order: BmsOrderInput): BmsOrder
  cpBmsOrderEdit(_id: String!, order: BmsOrderInput): BmsOrder
  cpBmsOrderRemove(ids: [String]): JSON

  bmsTourTranslationUpsert(input: TourTranslationInput!): TourTranslation
  bmsTourTranslationDelete(_id: String!): JSON
`;
