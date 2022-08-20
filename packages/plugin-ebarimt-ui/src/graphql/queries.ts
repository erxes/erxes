// Settings

const configs = `
  query configs {
    configs {
      _id
      code
      value
    }
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
  dealName: $dealName
  pipelineId: $pipelineId
  stageId: $stageId
  createdStartDate: $createdStartDate
  createdEndDate: $createdEndDate
  paidDate: $paidDate
`;

const responseFields = `
  _id
  createdAt
  modifiedAt
  contentType
  contentId
  success
  billId
  date
  macAddress
  internalCode
  billType
  lotteryWarningMsg
  errorCode
  message
  getInformation
  taxType
  qrData
  lottery
  amount
  cityTax
  vat
  cashAmount
  nonCashAmount
  returnBillId
  sendInfo
  stocks
  registerNo
  customerNo
  customerName
`;

const putResponses = `
  query putResponses(${listParamsDef}) {
    putResponses(${listParamsValue}) {
      ${responseFields}
    }
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
export default {
  configs,
  putResponses,
  putResponsesCount,
  putResponsesAmount,
  getDealLink
};
