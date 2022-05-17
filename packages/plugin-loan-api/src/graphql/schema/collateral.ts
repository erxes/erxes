import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = () => `

  ${attachmentType}
  ${attachmentInput}

  extend type User @key(fields: "_id") {
    _id: String! @external
  }
  type CollateralData {
    _id: String
    collateralId: String
    cost: Float
    percent: Float
    marginAmount: Float
    leaseAmount: Float
    insuranceTypeId: String
    currency: String
    insuranceAmount: Float
    certificate: String
    vinNumber: String
  }

  type Collateral {
    _id: String!
    status: String
    createdAt: Date
    number: String
    description: String
    marginAmount: Float
    leaseAmount: Float
    tenor: Float
    interestRate: Float
    repayment: String
    startDate: Date
    scheduleDay: Float
    collateralsData: JSON
    collateralData: CollateralData

    category: ProductCategory
    vendor: Company
    product: Product
    contractId: String
  }

  type CollateralsListResponse {
    list: [Collateral],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  categoryId: String
  productIds: [String]
  ids: [String]
  searchValue: String
  sortField: String
  sortDirection: Int
  conformityMainType: String
  conformityMainTypeId: String
  conformityRelType: String
  conformityIsRelated: Boolean
  conformityIsSaved: Boolean
`;

export const queries = `
  collateralsMain(${queryParams}): CollateralsListResponse
`;
