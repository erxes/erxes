import { gql } from '~/gql';

const putResponsesByDate = gql(`
  query ebarimtPutResponsesByDate(
    $limit: Int
    $cursor: String
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
  ) {
    putResponsesByDate(
      limit: $limit
      cursor: $cursor
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
    ) {
      date
      values {
        counter
        cityTax
        vat
        amount
      }
    }
  }
`);

export const byDateQueries = {
  putResponsesByDate,
};
