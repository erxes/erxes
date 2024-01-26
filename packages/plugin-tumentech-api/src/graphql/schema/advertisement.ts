export const types = ({ contacts, cards, products }) => `


type Advertisement @key(fields: "_id") @cacheControl(maxAge: 3) {
  _id: String!
  driverId: String
  carIds: [String]
  categoryIds: [String]
  type: String
  status: String

  startPlace: String
  startBegin: Date
  startEnd: Date

  endPlace: String
  endBegin: Date
  endEnd: Date

  generalPlace: String
  shift: String
  period: String

  createdAt : Date

  cars: [Car]
  ${products ? `categories: JSON` : ''}
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
categoryIds: [String],
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
period: String
`;
export const queries = `
    advertisements(${params}, page: Int, perPage: Int): AdvertisementListResponse
    advertisementDetail(_id: String!): Advertisement
`;

export const mutations = `
    advertisementAdd(${params}): Advertisement
    advertisementEdit(_id: String!, ${params}): Advertisement
    advertisementRemove(_id: String!): JSON
`;
