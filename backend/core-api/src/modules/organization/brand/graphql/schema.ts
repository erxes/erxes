import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Brand @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    name: String
    description: String
    code: String
    userId: String
    createdAt: Date
    emailConfig: JSON
    memberIds: [String]

    cursor: String
  }

  type BrandListResponse {
    list: [Brand]
    totalCount: Int
    pageInfo: PageInfo
  }
`;

const queryParams = `
  searchValue: String
  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  allBrands: [Brand]
  brands(${queryParams}): BrandListResponse
  brandDetail(_id: String!): Brand
  brandsTotalCount: Int
  brandsGetLast: Brand
`;

const mutationParams = `
  name: String!
  description: String
  emailConfig: JSON
`;

export const mutations = `
  brandsAdd(${mutationParams}): Brand
  brandsEdit(_id: String!, ${mutationParams}): Brand
  brandsRemove(_ids: [String!]): JSON
`;
