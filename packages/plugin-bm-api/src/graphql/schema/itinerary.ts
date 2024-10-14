import gql from 'graphql-tag';

export const types = () => `
  
  type ElementItem {
    elementId: String
    element: Element
    day: Int
    orderOfDay: Int
  }
  type Itinerary {
    _id: String!
    name: String
    content: String
    duration: Int
    elements :[ElementItem]
    location: [BMSLocation]
    images: [String]
    status: String
    createdAt: Date
    modifiedAt: Date
  }
  input ElementItemInput {
    elementId: String
    day: Int
    orderOfDay: Int
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
  bmItineraries( page:Int, perPage:Int): ListItinerary
`;

const params = `
  name: String,
  content: String,
  duration: Int,
  elements: [ElementItemInput],
  location: [BMSLocationInput],
  images: [String]
  status: STATUS
`;

export const mutations = `
  bmItineraryAdd(${params}): Itinerary
  bmItineraryRemove(ids: [String]): JSON
  bmItineraryEdit(_id:String!, ${params}): Itinerary

`;
