export const types = () => `
  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type ADconfig {
    _id: String!
    createdAt: Date
    modifiedAt: Date
    ownerId: String
    mergedIds: [String]
    description: String
    owner: User

    tagIds: [String]
    plateNumber: String
    vinNumber: String
    colorCode: String
    categoryId: String
    bodyType: String
    fuelType: String
    gearBox: String
    vintageYear: Float
    importYear: Float
    customFieldsData: JSON
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  tag: String
  segment: String
  segmentData: String
  categoryId: String
  ids: [String]
  searchValue: String
  sortField: String
  sortDirection: Int
  brand: String
`;

export const queries = `
  configs(${queryParams}): [ADconfig]
`;

const commonFields = `
  ownerId: String,
  description: String
  plateNumber: String
  vinNumber: String
  colorCode: String
  categoryId: String
  bodyType: String
  fuelType: String
  gearBox: String
  vintageYear: Float
  importYear: Float
  customFieldsData: JSON
`;

export const mutations = `
  configsAdd(${commonFields}): ADconfig
  configsEdit(_id: String!, ${commonFields}, customFieldsData: JSON): ADconfig
  configsRemove(carIds: [String]): [String]
`;
