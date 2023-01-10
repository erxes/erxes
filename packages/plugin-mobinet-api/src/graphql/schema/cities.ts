export const types = `
  type City @key(fields: "_id") @cacheControl(maxAge: 3){
    _id: String
    name: String
    code: String
    iso: String
    stat: String
    geoData: JSON
    createdAt: Date
    updatedAt: Date
  }

  type CityListResponse {
    list: [City],
    totalCount: Int
  }
`;

const mutationParams = `
    name: String!
    code: String!
    iso: String
    stat: String
    geoData: JSON
`;

export const mutations = `
  citiesAdd(${mutationParams}): City
  citiesEdit(_id: String!, ${mutationParams}): City
  citiesRemove(_ids: [String]): JSON
`;

const qryParams = `
    searchValue: String
    page: Int
    perPage: Int
`;

export const queries = `
  cityList(${qryParams}): CityListResponse
  cities(searchValue: String): [City]
  cityDetail(_id: String!): City
`;
