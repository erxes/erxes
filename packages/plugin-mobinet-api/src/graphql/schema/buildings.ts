export const types = ({ contacts, cards, products }) => `

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

${
  products ? `
    extend type Product @key(fields: "_id") {
      _id: String! @external
    }
  ` : ''
}

${
  cards
    ? `
        extend type Ticket @key(fields: "_id") {
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

  type ProductPriceConfig {
    productId: String
    price: Float

    product: Product
  }

  input ProductPriceConfigInput {
    productId: String
    price: Float
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
          companies: [Company]
          `
        : ''
    }

    suhId: String

    suh: Company

    productPriceConfigs: [ProductPriceConfig]



    customersCount: Int
    companiesCount: Int

    installationRequestIds: [String]
    ticketIds: [String]

    ${
      cards
        ? `
          installationRequests: [Ticket]
          tickets: [Ticket]
          `
        : ''
    }
  }

  type BuildingListResponse {
    list: [Building],
    totalCount: Int
  }

  input OSMBuilding {
    id: String
    properties: JSON
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
    suhId: String
`;

export const mutations = `
  buildingsAdd(${mutationParams}): Building
  buildingsEdit(_id: String!, ${mutationParams}): Building
  buildingsRemove(_id: [String]): JSON
  buildingsAddCustomers(_id: String!, customerIds: [String]): Building
  buildingsAddCompanies(_id: String!, companyIds: [String]): Building
  buildingsEditProductPriceConfigs(_id: String!, productPriceConfigs: [ProductPriceConfigInput]): Building


  buildingsRemoveCustomers(_id: String!, customerIds: [String]): Building
  buildingsRemoveCompanies(_id: String!, companyIds: [String]): Building
  buildingsSubmitServiceRequest(_id: String, buildingData: OSMBuilding, quarterId: String!, ticketData: JSON): Building
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
    customQuery: JSON
`;

export const queries = `
  buildingList(${qryParams}): BuildingListResponse
  buildings(${qryParams}): [Building]
  buildingsByBounds(bounds: JSON, serviceStatuses: [ServiceStatus]): [Building]
  buildingDetail(_id: String!): Building
`;
