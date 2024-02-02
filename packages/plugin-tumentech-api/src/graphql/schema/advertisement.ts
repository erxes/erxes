export const types = ({ contacts, cards, products }) => `


type Advertisement @key(fields: "_id") @cacheControl(maxAge: 3) {
  _id: String!
  driverId: String
  carIds: [String]
  productCategoryIds: [String]
  type: String
  status: String

  startPlace: String
  startBegin: Date
  startEnd: Date
  startPlaceObject: Place

  endPlace: String
  endBegin: Date
  endEnd: Date
  endPlaceObject: Place

  generalPlace: String
  shift: String
  period: String
  filterCarCategoryIds :[String]
  createdAt : Date

  cars: [Car]
  ${products ? `productCategories: JSON` : ''}
  ${contacts ? `driver: Customer` : ''}

}

  type AdvertisementListResponse {
    list: [Advertisement],
    totalCount: Int
  }


`;
const params = `
driverId: String,
carIds: [String],
productCategoryIds: [String],
type: String,
status: String,

startPlace: String,
startBegin: Date,
startEnd: Date,

endPlace: String,
endBegin: Date,
endEnd: Date,


generalPlace: String,
shift: String,
period: String,

filterCarCategoryIds: [String]
`;

const filters = `
driverId: String,
carIds: [String],
productCategoryIds: [String],
type: String,
status: String,

startPlace: String,
startDate: Date,


endPlace: String,
endDate: Date,


generalPlace: String,
shift: String,
period: String
filterCarCategoryIds: [String]
`;
export const queries = `
    advertisements(${filters}, page: Int, perPage: Int): AdvertisementListResponse
    advertisementDetail(_id: String!): Advertisement
`;

export const mutations = `
    advertisementAdd(${params}): Advertisement
    advertisementEdit(_id: String!, ${params}): Advertisement
    advertisementRemove(_id: String!): JSON
`;
