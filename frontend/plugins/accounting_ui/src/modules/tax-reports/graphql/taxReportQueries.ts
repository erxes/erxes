import { gql } from '~/gql';

export const TAX_REPORT_QUERY = gql(`
query accountingTaxReportData($kind: String!, $fromDate: Date!, $toDate: Date!, $branchId: String, $departmentId: String, $customerId: String) {
  taxReportData(
    kind: $kind
    fromDate: $fromDate
    toDate: $toDate
    branchId: $branchId
    departmentId: $departmentId
    customerId: $customerId
  )
}
`);
