export const types = `
  type Customer {
    _id: String!
    state: String
    createdAt: Date
    modifiedAt: Date
    avatar: String
    integrationId: String
    firstName: String
    lastName: String
    middleName: String
    birthDate: Date
    sex: Int
    email: String
    primaryEmail: String
    emails: [String]
    primaryPhone: String
    phones: [String]
    phone: String
    tagIds: [String]
    remoteAddress: String
    internalNotes: JSON
    location: JSON
    visitorContactInfo: JSON
    customFieldsData: JSON
    trackedData: JSON
    ownerId: String
    position: String
    department: String
    leadStatus: String
    hasAuthority: String
    description: String
    isSubscribed: String
    code: String
    emailValidationStatus: String
    phoneValidationStatus: String
    isOnline: Boolean
    lastSeenAt: Date
    sessionCount: Int
    urlVisits: [JSON]
    links: JSON
    companies: [Company]
    owner: User
    score: Float
  }

  type CustomersListResponse {
    list: [Customer],
    totalCount: Float,
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
  customers(${queryParams}): [Customer]
  customerDetail(_id: String): Customer
`;

const mutationParams = `
  firstName: String
  lastName: String
  email: String
  phone: String
  sex: Int
`;

export const mutations = `
  customersAdd(${mutationParams}): Customer
`;
