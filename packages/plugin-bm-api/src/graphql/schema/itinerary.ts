import gql from "graphql-tag";

export const types = () => `
  
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
    totalcost: Float
    groupDays :[DayItem]
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
  type ListItinerary {
    list: [Itinerary]
    total: Int
  }
`;

export const queries = `
  bmItineraries(sortField:String, sortDirection:Int, page:Int, perPage:Int,branchId: String): ListItinerary
  bmItineraryDetail(_id:String!, branchId: String): Itinerary
`;

const params = `
  branchId: String,
  name: String,
  content: String,
  duration: Int,
  totalcost: Float,
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
  guideCostExtra:Float
  extra: JSON
`;

export const mutations = `
  bmItineraryAdd(${params}): Itinerary
  bmItineraryRemove(ids: [String],branchId:String): JSON
  bmItineraryEdit(_id:String!, ${params}): Itinerary

`;
