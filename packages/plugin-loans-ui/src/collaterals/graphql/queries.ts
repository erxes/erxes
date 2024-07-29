import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from "@erxes/ui-sales/src/conformity";

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

export const collateralTypesMain = `
  query CollateralTypesMain($page: Int, $perPage: Int) {
    collateralTypesMain(page: $page, perPage: $perPage) {
      list {
        _id
        code
        name
        description
        type
        startDate
        endDate
        status
        currency
      }
    }
  }
`;

export const collateralTypes = `
  query collateralTypes($page: Int, $perPage: Int) {
    collateralTypes(page: $page, perPage: $perPage) {
      _id
      code
      name
      description
      type
      startDate
      endDate
      status
      currency
      config{
        defaultPercent
      }
    }
  }
`;

export const collateralTypeDetail = `
query collateralTypeDetail($id: String!) {
  collateralTypeDetail(_id: $id) {
    _id
    code
    name
    description
    type
    startDate
    endDate
    status
    currency
    config {
      collateralType
      defaultPercent
      maxPercent
      minPercent
      riskClosePercent
    }
    property {
      sizeSquare
      sizeSquareUnit
      cntRoom
      startDate
      endDate
      quality
      purpose
      mark
      color
      power
      frameNumber
      importedDate
      factoryDate
      courtOrderDate
      mrtConfirmedDate
      cmrtRegisteredDate
      mrtRegisteredDate
      courtOrderNo
      mrtOrg
      registeredToAuthority
      causeToShiftTo
    }
  }
}
`;

export default {
  collateralsMain,
  collateralTypesMain,
  collateralTypeDetail,
  collateralTypes
};
