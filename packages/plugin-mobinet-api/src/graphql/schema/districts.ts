export const types = `
  type District @key(fields: "_id") @cacheControl(maxAge: 3){
    _id: String
    name: String
    code: String
    cityId: String
    center: JSON
    isCapital: Boolean
    createdAt: Date
    updatedAt: Date

    city: City
  }

  type DistrictListResponse {
    list: [District],
    totalCount: Int
  }
`;

const mutationParams = `
    name: String!
    
    cityId: String
    center: JSON
    isCapital: Boolean
`;

export const mutations = `
  districtsAdd(${mutationParams}): District
  districtsEdit(_id: String!, ${mutationParams}): District
  districtsRemove(_ids: [String]): JSON
`;

const qryParams = `
    searchValue: String
    cityId: String
    page: Int
    perPage: Int
`;

export const queries = `
  districtList(${qryParams}): DistrictListResponse
  districts(${qryParams}): [District]
  districtDetail(_id: String!): District
  districtByCoordinates(lat: Float!, lng: Float!): District
`;
