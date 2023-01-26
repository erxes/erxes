export const types = ({ contacts }) => `

${
  contacts
    ? `
        extend type Customer @key(fields: "_id") {
          _id: String! @external
        }
  
        extend type Company @key(fields: "_id") {
          _id: String! @external
        }
        `
    : ''
}

enum ServiceStatus {
  active
  inactive
  inprogress
}

  type Building @key(fields: "_id") @cacheControl(maxAge: 3){
    _id: String
    name: String
    code: String
    description: String
    quarterId: String
    location: JSON

    serviceStatus: ServiceStatus

    color: String

    osmbId: String
    bounds: JSON
    createdAt: Date
    updatedAt: Date
    type: String

    quarter: Quarter

    customerIds: [String]
    ${
      contacts
        ? `
          customers: [Customer]
          `
        : ''
    }
  }

  type BuildingListResponse {
    list: [Building],
    totalCount: Int
  }
`;

const mutationParams = `
    name: String!
    code: String!
    description: String
    quarterId: String
    osmbId: String
    customerIds: [String]
    location: JSON
    bounds: JSON
    type: String
    serviceStatus: ServiceStatus
`;

export const mutations = `
  buildingsAdd(${mutationParams}): Building
  buildingsEdit(_id: String!, ${mutationParams}): Building
  buildingsRemove(_id: [String]): JSON
`;

const qryParams = `
    searchValue: String
    quarterId: String
    districtId: String
    type: String
    customerIds: [String]
    osmbId: String
    cityId: String
    page: Int
    perPage: Int
`;

export const queries = `
  buildingList(${qryParams}): BuildingListResponse
  buildings(${qryParams}): [Building]
  buildingsByBounds(bounds: JSON, serviceStatuses: [ServiceStatus]): [Building]
  buildingDetail(_id: String!): Building
`;
