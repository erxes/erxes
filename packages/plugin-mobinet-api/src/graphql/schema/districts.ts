export const types = `
  type District @key(fields: "_id") @cacheControl(maxAge: 3){
    _id: String
    name: String
    code: String
    cityId: String
    center: JSON
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
    code: String!
    cityId: String
    center: JSON
`;

export const mutations = `
  districtAdd(${mutationParams}): District
  districtEdit(_id: String!, ${mutationParams}): District
  districtRemove(_id: String!): JSON
`;

const qryParams = `
    searchValue: String
    cityId: String
    page: Int
    perPage: Int
`;

export const queries = `
  districts(${qryParams}): DistrictListResponse
  districtDetail(_id: String!): District
`;
