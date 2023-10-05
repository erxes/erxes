const posOrderFields = contactsEnabled => `
  _id: String,
  createdAt: Date,
  status: String,
  paidDate: Date,
  dueDate: Date,
  number: String,
  customerId: String,
  customerType: String,
  cashAmount: Float,
  mobileAmount: Float,
  paidAmounts: JSON,
  totalAmount: Float,
  finalAmount: Float,
  shouldPrintEbarimt: Boolean,
  printedEbarimt: Boolean,
  billType: String,
  billId: String,
  registerNumber: String,
  oldBillId: String,
  type: String,
  userId: String,
  items: JSON,
  posToken: String,
  posName: String,
  branchId: String,
  departmentId: String,
  subBranchId: String,
  branch: JSON,
  department: JSON,
  subBranch: JSON,
  user: User,
  ${
    contactsEnabled
      ? `
      customer: CustomerPos
    `
      : ''
  }
  syncedErkhet: Boolean,
  description: String,
  isPre: Boolean,
  origin: String,
  convertDealId: String,
  returnInfo: JSON
`;

export const types = ({ contactsEnabled, productsEnabled }) => `
  type CustomerPos {
    _id: String!
    code: String
    primaryPhone: String
    firstName: String
    primaryEmail: String
    lastName: String
  }

  type PosOrder {
    ${posOrderFields(contactsEnabled)}
  }

  type PosOrderDetail {
    ${posOrderFields(contactsEnabled)}
    syncErkhetInfo: String
    putResponses: JSON
    deliveryInfo: JSON
    deal: JSON
    dealLink: String
  }

  type PosOrderRecord {
    ${posOrderFields(contactsEnabled)}
  }

  type PosProduct {
    _id: String!
    name: String
    code: String
    type: String
    uom: String
    unitPrice: Float
    categoryId: String
    createdAt: Date,
    counts: JSON,
    count: Float,
    amount: Float,
    ${
      productsEnabled
        ? `
        category: ProductCategory
      `
        : ''
    }
  }
  type PosProducts {
    products: [PosProduct],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  sortField: String
  sortDirection: Int
  search: String
  paidStartDate: Date
  paidEndDate: Date
  createdStartDate: Date
  createdEndDate: Date
  paidDate: String
  userId: String
  customerId: String
  customerType: String
  posId: String
  posToken: String
  types: [String]
  statuses: [String]
  excludeStatuses: [String] 
  hasPaidDate: Boolean 
`;

const groupParams = `
  groupField: String
`;

export const queries = `
  posOrders(${queryParams}): [PosOrder]
  posOrderDetail(_id: String): PosOrderDetail
  posProducts(${queryParams} categoryId: String, searchValue: String): PosProducts
  posOrdersSummary(${queryParams}): JSON
  posOrdersGroupSummary(${queryParams}, ${groupParams}): JSON
  posOrdersTotalCount(${queryParams}): JSON
  posOrderRecords(${queryParams}): [PosOrderRecord]
  posOrderRecordsCount(${queryParams}): Int
`;

export const mutations = `
  posOrderReturnBill(_id: String!): PosOrder
  posOrderChangePayments(_id: String!, cashAmount: Float, mobileAmount: Float, paidAmounts: JSON, description: String): PosOrder
`;
