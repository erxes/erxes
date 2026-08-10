import { gql } from '@apollo/client';
import { REPORT_CHART_FIELDS } from '@/report/graphql/queries/getReportCharts';

export const ADD_REPORT_CHART = gql`
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
  ${REPORT_CHART_FIELDS}
`;

export const REMOVE_REPORT_CHART = gql`
  mutation ReportChartRemove($_id: String!) {
    reportChartRemove(_id: $_id) {
      _id
    }
  }
`;
