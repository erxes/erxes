export const types = `
  type PosCustomer {
    _id: String!
    code: String
    primaryPhone: String
    firstName: String
    primaryEmail: String
    lastName: String
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  segment: String
  type: String
  tag: String
  ids: [String]
  excludeIds: Boolean
  searchValue: String
  autoCompletion: Boolean
  autoCompletionType: String
  brand: String
  integration: String
  form: String
  startDate: String
  endDate: String
  leadStatus: String
  sortField: String
  sortDirection: Int
  sex: Int
  birthDate: Date
`;

export const queries = `
  poscCustomers(${queryParams}): [PosCustomer]
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
