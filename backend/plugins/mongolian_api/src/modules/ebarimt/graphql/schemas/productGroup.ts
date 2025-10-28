import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

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

  type EbarimtProductGroupListResponse {
    list: [EbarimtProductGroup]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  searchValue: String,
  productId: String,
  status: String,

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  ebarimtProductGroups(${queryParams}): EbarimtProductGroupListResponse
  ebarimtProductGroupsCount(${queryParams}): Int
`;

const mutationParams = `
  mainProductId: String
  subProductId: String
  sortNum: Float
  ratio: Float
  isActive: Boolean
`;

export const mutations = `
  ebarimtProductGroupCreate(${mutationParams}): EbarimtProductGroup
  ebarimtProductGroupUpdate(_id: String, ${mutationParams}): EbarimtProductGroup
  ebarimtProductGroupsRemove(ids: [String]): JSON
`;
