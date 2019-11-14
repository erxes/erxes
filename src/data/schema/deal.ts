import { commonTypes, conformityQueryFields } from './common';

export const types = `
  type Deal {
    _id: String!
    amount: JSON
    companies: [Company]
    customers: [Customer]
    products: JSON
    productsData: JSON
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

const commonMutationParams = `
  stageId: String,
  assignedUserIds: [String],
  attachments: [AttachmentInput],
  closeDate: Date,
  description: String,
  order: Int,
  productsData: JSON,
  reminderMinute: Int,
  isComplete: Boolean,
  priority: String
`;

const commonQueryParams = `
  date: ItemDate
  pipelineId: String
  customerIds: [String]
  companyIds: [String]
  assignedUserIds: [String]
  productIds: [String]
  nextDay: String
  nextWeek: String
  nextMonth: String
  noCloseDate: String
  overdue: String
  labelIds: [String]
  search: String
  priority: [String]
`;

export const queries = `
  dealDetail(_id: String!): Deal
  deals(
    initialStageId: String
    stageId: String
    skip: Int
    ${commonQueryParams}
    ${conformityQueryFields}
  ): [Deal]
  dealsTotalAmounts(
    ${commonQueryParams}
    ${conformityQueryFields}
  ): DealTotalAmounts
`;

export const mutations = `
  dealsAdd(name: String!, ${commonMutationParams}): Deal
  dealsEdit(_id: String!, name: String, ${commonMutationParams}): Deal
  dealsChange( _id: String!, destinationStageId: String): Deal
  dealsUpdateOrder(stageId: String!, orders: [OrderItem]): [Deal]
  dealsRemove(_id: String!): Deal
  dealsWatch(_id: String, isAdd: Boolean): Deal
`;
