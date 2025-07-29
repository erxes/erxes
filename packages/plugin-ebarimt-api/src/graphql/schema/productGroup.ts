export const types = `
  type EbarimtProductGroup {
    _id: String
    createdAt: Date
    modifiedAt: Date
    modifiedBy: String
    mainProductId: String
    subProductId: String
    sortNum: Float
    ratio: Float
    isActive: Boolean

    mainProduct: Product
    subProduct: Product
    modifiedUser: User

  }
`;

const queryParams = `
  searchValue: String,
  productId: String,
  status: String,
`;

const mutationParams = `
  mainProductId: String
  subProductId: String
  sortNum: Float
  ratio: Float
  isActive: Boolean
`;

export const queries = `
  ebarimtProductGroups(${queryParams}, page: Int, perPage: Int, sortField: String, sortDirection: Int): [EbarimtProductGroup]
  ebarimtProductGroupsCount(${queryParams}): Int
`;

export const mutations = `
  ebarimtProductGroupCreate(${mutationParams}): EbarimtProductGroup
  ebarimtProductGroupUpdate(_id: String, ${mutationParams}): EbarimtProductGroup
  ebarimtProductGroupsRemove(ids: [String]): JSON
`;
