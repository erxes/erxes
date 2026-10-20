import { gql } from '~/gql';

export const ADD_REPORT_CHART = gql(`
  mutation ReportChartAdd(
    $name: String!
    $chartType: String!
    $visualType: String
    $colSpan: Int
    $filters: TicketReportFilter
  ) {
    reportChartAdd(
      name: $name
      chartType: $chartType
      visualType: $visualType
      colSpan: $colSpan
      filters: $filters
    ) {
      ...ReportChartFields
    }
  }
`);

export const REMOVE_REPORT_CHART = gql(`
  mutation ReportChartRemove($_id: String!) {
    reportChartRemove(_id: $_id) {
      _id
    }
  }
`);
