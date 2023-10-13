export const types = `
  type PosCustomer {
    _id: String!
    code: String
    primaryPhone: String
    primaryEmail: String
    firstName: String
    lastName: String
    primaryAddress: JSON
    addresses: [JSON]
  }
`;

export const queries = `
  poscCustomers(searchValue: String!, type: String, perPage: Int, page: Int): [PosCustomer]
  poscCustomerDetail(_id: String!, type: String): PosCustomer
`;

const mutationParams = `
  firstName: String
  lastName: String
  email: String
  phone: String
  sex: Int
`;

export const mutations = `
  poscCustomersAdd(${mutationParams}): PosCustomer
`;
