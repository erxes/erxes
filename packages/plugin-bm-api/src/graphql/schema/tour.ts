import gql from 'graphql-tag';

// name: field({ type: String, optional: true, label: 'name' }),
// content: field({ type: String, optional: true, label: 'content' }),
// duration: field({ type: Number, optional: true, label: 'number' }),
// location: field({
//   type: [locationSchema],
//   optional: true,
//   label: 'location',
// }),
// itineraryId: field({ type: String, optional: true, label: 'initeraryId' }),
// startDate: field({ type: Date, optional: true, label: 'date' }),
// endDate: field({ type: Date, optional: true, label: 'date' }),
// groupSize: field({ type: Number, optional: true, label: 'group size' }),
// status: field({
//   type: String,
//   enum: getEnum(),
//   default: '',
//   optional: true,
//   label: 'status',
//   esType: 'keyword',
//   selectOptions: STATUS_TYPES,
// }),
// cost: field({ type: Number, optional: true, label: 'cost' }),
export const types = () => `

  enum STATUS_TOUR {
    running
    compeleted
    scheduled
    cancelled
  }

  type Tour {
    _id: String!
    name: String
    content: String
    duration: Int
    location: [BMSLocation]
    itineraryId: String
    itinerary: Itinerary
    startDate: Date
    endDate: Date
    groupSize: Int
    status: String
    cost: Float
    createdAt: Date
    modifiedAt: Date
  }


`;

export const queries = `
  bmTours( page:Int, perPage:Int): [Tour]
`;

const params = `
  name: String,
  content: String,
  itineraryId:String!,
  startDate: Date,
  endDate: Date,
  groupSize: Int,
  duration: Int,
  status: STATUS_TOUR,
  cost: Float,
  location: [BMSLocationInput]
`;

export const mutations = `
  bmTourAdd(${params}): Itinerary
  bmTourRemove(ids: [String]): JSON
  bmTourEdit(_id:String!, ${params}): Itinerary

`;
