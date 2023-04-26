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
  }

  type CustomerAccountListResponse {
    list: [CustomerAccount],
    totalCount: Int
  }
`;

export const queries = `
    getAccount: CustomerAccount

    customerAccount(customerId: String!): CustomerAccount
    customerAccountsList(page: Int, perPage: Int): CustomerAccountListResponse

    getEbarimt(topupId: String!, companyRegNumber: String, companyName: String): JSON
`;

export const mutations = `
  topupAccount(invoiceId: String): JSON
  revealPhone(driverId: String, carId: String, dealId: String): String

  manualTopup(customerId: String!, amount: Float!): JSON
`;
