import { gql } from '@apollo/client';

const putResponsesByDate = gql`
  query putResponsesByDate(
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
    )
  }
`;

export const byDateQueries = {
  putResponsesByDate,
};
