import {
  commonDragParams,
  commonListTypes,
  commonMutationParams,
  commonTypes,
  conformityQueryFields,
  copyParams
} from './common';

export const types = `
  type DealListItem {
    products: JSON
    amount: JSON
    ${commonListTypes}
  }
    
  type Deal {
    _id: String!
    amount: JSON
    companies: [Company]
    customers: [Customer]
    products: JSON
    productsData: JSON
    paymentsData: JSON
    ${commonTypes}
  }

  type DealTotalCurrency {
    amount: Float
    name: String
  }

  type TotalForType {
    _id: String
    name: String
    currencies: [DealTotalCurrency]
  }

  type DealTotalAmounts {
    _id: String
    dealCount: Int
    totalForType: [TotalForType]
  }
`;

const dealMutationParams = `
  paymentsData: JSON,
  productsData: JSON,
`;

const commonQueryParams = `
  date: ItemDate
  pipelineId: String
  customerIds: [String]
  companyIds: [String]
  assignedUserIds: [String]
  productIds: [String]
  closeDateType: String
  labelIds: [String]
  search: String
  priority: [String]
  sortField: String
  sortDirection: Int
  userIds: [String]
  `;

export const queries = `
  dealDetail(_id: String!): Deal
  deals(
    initialStageId: String
    stageId: String
    skip: Int
    limit: Int
    ${commonQueryParams}
    ${conformityQueryFields}
    ): [DealListItem]
  archivedDeals(pipelineId: String!, search: String, page: Int, perPage: Int): [Deal]
  archivedDealsCount(pipelineId: String!, search: String): Int
  dealsTotalAmounts(
    ${commonQueryParams}
    ${conformityQueryFields}
  ): DealTotalAmounts
`;

export const mutations = `
  dealsAdd(name: String!, ${copyParams}, ${dealMutationParams}, ${commonMutationParams}): Deal
  dealsEdit(_id: String!, name: String, ${dealMutationParams}, ${commonMutationParams}): Deal
  dealsChange(${commonDragParams}): Deal
  dealsRemove(_id: String!): Deal
  dealsWatch(_id: String, isAdd: Boolean): Deal
  dealsCopy(_id: String!, proccessId: String): Deal
  dealsArchive(stageId: String!, proccessId: String): String
`;
