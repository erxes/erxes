import gql from 'graphql-tag';

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
    info1: String
    info2: String
    info3: String
    info4: String

    createdAt: Date
    modifiedAt: Date
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
  bmItineraries( page:Int, perPage:Int,branchId: String): ListItinerary
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
  info1: String,
  info2: String,
  info3: String,
  info4: String
`;

export const mutations = `
  bmItineraryAdd(${params}): Itinerary
  bmItineraryRemove(ids: [String],branchId:String): JSON
  bmItineraryEdit(_id:String!, ${params}): Itinerary

`;
