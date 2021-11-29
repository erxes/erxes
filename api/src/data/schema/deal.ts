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
  segment: String
  assignedToMe: String
  startDate: String
  endDate: String
  `;

const listQueryParams = `
    initialStageId: String
    stageId: String
    skip: Int
    limit: Int
    ${commonQueryParams}
    ${conformityQueryFields}
 `;

const archivedDealsParams = `
  pipelineId: String! 
  search: String 
  userIds: [String]
  priorities: [String]
  assignedUserIds: [String]
  labelIds: [String]
  productIds: [String]
  companyIds: [String]
  customerIds: [String]
  startDate: String
  endDate: String
 `;

export const queries = `
  dealDetail(_id: String!): Deal
  deals(${listQueryParams}): [DealListItem]
  dealsTotalCount(${listQueryParams}): Int
  archivedDeals(
    page: Int 
    perPage: Int 
    ${archivedDealsParams}
  ): [Deal]
  archivedDealsCount(
    ${archivedDealsParams}
  ): Int
  dealsTotalAmounts(
    ${commonQueryParams}
    ${conformityQueryFields}
  ): [TotalForType]
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
