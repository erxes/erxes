export const types = ({ contacts }) => `
type CustomerAccount @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    balance: Float
    customerId: String

    ${
      contacts
        ? `
        customer: Customer
        `
        : ''
    }

    driverGroups: [DriverGroup]
  }

  type DriverGroup {
    name: String
    description: String
    driverIds: [String]
    ${
      contacts
        ? `
        drivers: [Customer]
        `
        : ''
    }
  }

  input DriverGroupInput {
    name: String
    description: String
    driverIds: [String]
  }

  type CustomerAccountListResponse {
    list: [CustomerAccount],
    totalCount: Int
  }

  enum SearchType {
    phone
    plateNumber
  }
  

  type SearchResult {
    error: String
    success: String
    foundDriver: Customer
    foundCar: Car
  }
`;

export const queries = `
    getAccount: CustomerAccount

    customerAccount(customerId: String!): CustomerAccount
    customerAccountsList(page: Int, perPage: Int): CustomerAccountListResponse

    getEbarimt(topupId: String!, companyRegNumber: String, companyName: String): JSON

    searchDriver(type: SearchType!, value: String!): SearchResult
`;

export const mutations = `
  topupAccount(invoiceId: String): JSON
  revealPhone(driverId: String, carId: String, dealId: String): String
  customerAccountEditDriverGroups( driverGroups: [DriverGroupInput]): CustomerAccount
  
  manualTopup(customerId: String!, amount: Float!): JSON
`;
