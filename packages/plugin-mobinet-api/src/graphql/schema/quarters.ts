export const types = `
  type Quarter @key(fields: "_id") @cacheControl(maxAge: 3){
    _id: String
    name: String
    code: String
    districtId: String
    center: JSON
    createdAt: Date
    updatedAt: Date

    district: District
  }

  type QuarterListResponse {
    list: [Quarter],
    totalCount: Int
  }
`;

const mutationParams = `
    name: String!
    code: String!
    districtId: String
    center: JSON
`;

export const mutations = `
  quartersAdd(${mutationParams}): Quarter
  quartersEdit(_id: String!, ${mutationParams}): Quarter
  quartersRemove(_id: [String]): JSON
`;

const qryParams = `
    searchValue: String
    districtId: String
    cityId: String
    page: Int
    perPage: Int
`;

export const queries = `
  quarterList(${qryParams}): QuarterListResponse
  quarters(${qryParams}): [Quarter]
  quarterDetail(_id: String!): Quarter
`;
