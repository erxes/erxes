import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  
  type ElementItem {
    elementId: String
    element: Element
    orderOfDay: Int
  }
  type DayItem {
    day: Int
    images: [String]
    content: String
    elements: [ElementItem]
    elementsQuick: [ElementItem]
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
  }
  input ElementItemInput {
    elementId: String
    orderOfDay: Int
  }
  input DayItemInput {
    day: Int
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
  bmsItineraries( ${GQL_CURSOR_PARAM_DEFS},branchId: String): ItineraryListResponse
  bmsItineraryDetail(_id:String!, branchId: String): Itinerary
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
  extra: JSON
`;

export const mutations = `
  bmsItineraryAdd(${params}): Itinerary
  bmsItineraryRemove(ids: [String],branchId:String): JSON
  bmsItineraryEdit(_id:String!, ${params}): Itinerary

`;
