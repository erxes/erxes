// Settings

const configs = `
  query configsGetValue($code: String!) {
    configsGetValue(code: $code)
  }
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $sortField: String
  $sortDirection: Int
  $search: String
  $contentType: String
  $success: String
  $billType: String
  $billIdRule: String
  $isLast: String
  $orderNumber: String
  $contractNumber: String
  $transactionNumber: String
  $dealName: String
  $pipelineId: String
  $stageId: String
  $createdStartDate: Date
  $createdEndDate: Date
  $paidDate: String
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  sortField: $sortField
  sortDirection: $sortDirection
  search: $search
  contentType: $contentType
  success: $success
  billType: $billType
  billIdRule: $billIdRule
  isLast: $isLast
  orderNumber: $orderNumber
  contractNumber: $contractNumber
  transactionNumber: $transactionNumber
  dealName: $dealName
  pipelineId: $pipelineId
  stageId: $stageId
  createdStartDate: $createdStartDate
  createdEndDate: $createdEndDate
  paidDate: $paidDate
`;

export const responseFields = `
  _id
  number

  contentType
  contentId

  totalAmount
  totalVAT
  totalCityTax
  districtCode
  branchNo
  merchantTin
  posNo
  customerTin
  customerName
  consumerNo
  type
  inactiveId
  invoiceId
  reportMonth
  data
  receipts
  payments

  easy

  getInformation
  sendInfo
  state

  createdAt
  modifiedAt

  id
  posId
  status
  message
  qrData
  lottery
  date
`;

const putResponses = `
  query putResponses(${listParamsDef}) {
    putResponses(${listParamsValue}) {
      ${responseFields}
    }
  }
`;

const putResponsesByDate = `
  query putResponsesByDate(${listParamsDef}) {
    putResponsesByDate(${listParamsValue})
  }
`;

const putResponsesDuplicated = `
  query putResponsesDuplicated($billType: String, $startDate: Date, $endDate: Date, $page: Int, $perPage: Int) {
    putResponsesDuplicated(billType: $billType, startDate: $startDate, endDate: $endDate, page: $page, perPage: $perPage)
  }
`;

const putResponsesDuplicatedDetail = `
  query putResponsesDuplicatedDetail($contentId: String, $taxType: String) {
    putResponsesDuplicatedDetail(contentId: $contentId, taxType: $taxType) {
      ${responseFields}
    }
  }
`;

const putResponsesDuplicatedCount = `
  query putResponsesDuplicatedCount($billType: String, $startDate: Date, $endDate: Date) {
    putResponsesDuplicatedCount(billType: $billType, startDate: $startDate, endDate: $endDate)
  }
`;

const putResponsesCount = `
  query putResponsesCount(${listParamsDef}) {
    putResponsesCount(${listParamsValue})
  }
`;

const putResponsesAmount = `
  query putResponsesAmount(${listParamsDef}) {
    putResponsesAmount(${listParamsValue})
  }
`;

const getDealLink = `
  query getDealLink($_id: String) {
    getDealLink(_id: $_id)
  }
`;

export const ebarimtProductRuleFields = `
  _id
  createdAt
  modifiedAt
  title
  productIds
  productCategoryIds
  excludeCategoryIds
  excludeProductIds
  tagIds
  excludeTagIds
  kind
  taxType
  taxCode
  taxPercent
`;

const productRuleQryParamsDef = `
  $searchValue: String,
  $productId: String,
  $kind: String,
  $taxCode: String,
  $taxType: String,
`;

const productRuleQryParamsVal = `
  searchValue: $searchValue,
  productId: $productId,
  kind: $kind,
  taxCode: $taxCode,
  taxType: $taxType,
`;

const ebarimtProductRules = `
  query ebarimtProductRules(
    ${productRuleQryParamsDef}
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
  ) {
    ebarimtProductRules(
      ${productRuleQryParamsVal}
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      ${ebarimtProductRuleFields}
    }
  }
`;

const ebarimtProductRulesCount = `
  query ebarimtProductRulesCount(${productRuleQryParamsDef}) {
    ebarimtProductRulesCount(${productRuleQryParamsVal})
  }
`;

export default {
  configs,
  putResponses,
  putResponsesByDate,
  putResponsesCount,
  putResponsesAmount,
  getDealLink,
  putResponsesDuplicated,
  putResponsesDuplicatedCount,
  putResponsesDuplicatedDetail,
  ebarimtProductRules,
  ebarimtProductRulesCount,
};
