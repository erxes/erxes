import {
  commonDragParams,
  commonListTypes,
  commonMutationParams,
  commonTypes,
  conformityQueryFields,
  copyParams
} from './common';

export const types = ({ contacts, tags }) => `
  type DealListItem @key(fields: "_id") {
    products: JSON
    unUsedAmount: JSON
    amount: JSON
    customFieldsData: JSON
    ${commonListTypes}
  }

  type Deal @key(fields: "_id") {
    _id: String!
    unUsedAmount: JSON
    amount: JSON

    ${
      contacts
        ? `
      companies: [Company]
      customers: [Customer]
      `
        : ''
    }

    ${tags ? `tags: [Tag]` : ''}

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

  input ProductField {
    productId : String
    quantity: Int
  }

`;

const dealMutationParams = `
  paymentsData: JSON,
  productsData: JSON,
`;

const commonQueryParams = `
  _ids: [String]
  date: ItemDate
  parentId:String
  pipelineId: String
  pipelineIds: [String]
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
  segmentData: String
  assignedToMe: String
  startDate: String
  endDate: String
  hasStartAndCloseDate: Boolean
  stageChangedStartDate: Date
  stageChangedEndDate: Date
  noSkipArchive: Boolean
  tagIds: [String]
  number: String
  branchIds: [String]
  departmentIds: [String]
  boardIds: [String]
  stageCodes: [String]
  dateRangeFilters:JSON,
  createdStartDate: Date,
  createdEndDate: Date
  stateChangedStartDate: Date
  stateChangedEndDate: Date
  startDateStartDate: Date
  startDateEndDate: Date
  closeDateStartDate: Date
  closeDateEndDate: Date
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
  checkDiscount(_id: String!,products:[ProductField]):JSON
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
  dealsCreateProductsData(proccessId: String, dealId: String, docs: JSON): JSON
  dealsEditProductData(proccessId: String, dealId: String, dataId: String, doc: JSON): JSON
  dealsDeleteProductData(proccessId: String, dealId: String, dataId: String): JSON
`;
