import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  
  type ElementItem {
    elementId: String
    element: Element
    orderOfDay: Int
  }
  type DayItem {
    day: Int
    title: String
    images: [String]
    content: String
    elements: [ElementItem]
    elementsQuick: [ElementItem]
  }

  input DayItemTranslationInput {
    day: Int!
    title: String
    content: String
  }

  input BmsItineraryTranslationInput {
    objectId: String
    language: String!
    name: String
    content: String
    foodCost: Float
    gasCost: Float
    driverCost: Float
    guideCost: Float
    guideCostExtra: Float
    groupDays: [DayItemTranslationInput]
  }

  type ItineraryTranslationDayItem {
    day: Int
    title: String
    content: String
  }

  type ItineraryTranslation {
    _id: String!
    objectId: String!
    language: String!
    name: String
    content: String
    foodCost: Float
    gasCost: Float
    driverCost: Float
    guideCost: Float
    guideCostExtra: Float
    groupDays: [ItineraryTranslationDayItem]
    createdAt: Date
    updatedAt: Date
  }

  type Itinerary {
    _id: String!
    branchId: String
    name: String
    content: String
    duration: Int
    totalCost: Float
    groupDays: [DayItem]
    location: [BMSLocation]
    images: [String]
    status: String
    color: String

    
    foodCost:Float
    personCost: JSON
    extra: JSON
    gasCost: Float
    driverCost: Float
    guideCost:Float
    guideCostExtra: Float
    createdAt: Date
    modifiedAt: Date
    tours: [Tour]
    translations: [ItineraryTranslation]
  }
  input ElementItemInput {
    elementId: String
    orderOfDay: Int
  }
  input DayItemInput {
    day: Int
    title: String
    images: [String]
    content: String
    elements: [ElementItemInput]
    elementsQuick: [ElementItemInput]
  }


  enum STATUS {
    published
    draft
  }

  type ItineraryListResponse {
    list: [Itinerary]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

export const queries = `
  bmsItineraries( ${GQL_CURSOR_PARAM_DEFS},branchId: String, name: String, language: String): ItineraryListResponse
  bmsItineraryDetail(_id:String!, branchId: String, language: String): Itinerary
`;

const params = `
  branchId: String,
  name: String,
  content: String,
  duration: Int,
  totalCost: Float,
  groupDays: [DayItemInput],
  location: [BMSLocationInput],
  images: [String],
  status: STATUS,
  color: String,
  foodCost:Float,
  personCost: JSON,
  gasCost: Float,
  driverCost: Float,
  guideCost:Float,
  guideCostExtra:Float,
  extra: JSON,
  translations: [BmsItineraryTranslationInput]
`;

export const mutations = `
  bmsItineraryAdd(${params}): Itinerary
  bmsItineraryRemove(ids: [String],branchId:String): JSON
  bmsItineraryEdit(_id:String!, ${params}): Itinerary

`;
