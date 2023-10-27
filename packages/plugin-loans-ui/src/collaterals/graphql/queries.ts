import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from '@erxes/ui-cards/src/conformity';

const collateralFields = `
  _id
  status
  createdAt
  number
  description
  marginAmount
  leaseAmount
  tenor
  interestRate
  repayment
  startDate
  scheduleDay
  collateralsData

  collateralData {
    _id
    collateralId
    cost
    percent
    marginAmount
    leaseAmount
    insuranceTypeId
    currency
    insuranceAmount
    certificate
    vinNumber
  }

  category {
    _id
    code
    name
  }
  vendor {
    _id
    code
    primaryName
  }
  product {
    _id
    code
    name
  }
  contractId
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $categoryId: String
  $productIds: [String]
  $ids: [String]
  $searchValue: String
  $sortField: String
  $sortDirection: Int
  ${conformityQueryFields}
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  categoryId: $categoryId
  productIds: $productIds
  ids: $ids
  searchValue: $searchValue
  sortField: $sortField
  sortDirection: $sortDirection
  ${conformityQueryFieldDefs}
`;

export const collateralsMain = `
  query collateralsMain(${listParamsDef}) {
    collateralsMain(${listParamsValue}) {
      list {
        ${collateralFields}
      }
      totalCount
    }
  }
`;

export default {
  collateralsMain
};
