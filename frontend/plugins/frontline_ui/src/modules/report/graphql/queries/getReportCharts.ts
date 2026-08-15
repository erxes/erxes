import { gql } from '@apollo/client';

export const REPORT_CHART_FIELDS = gql`
  fragment ReportChartFields on ReportChart {
    _id
    name
    chartType
    visualType
    colSpan
    filters {
      date
      fromDate
      toDate
      source
      state
      statusIds
      frequency
      groupPropertyId
      channelIds
      memberIds
      pipelineIds
      tagIds
      customerIds
      companyIds
      propertyIds
      priority
      propertyValueFilters {
        propertyId
        type
        values
      }
    }
  }
`;

export const GET_REPORT_CHARTS = gql`
  query ReportCharts($chartType: String) {
    reportCharts(chartType: $chartType) {
      ...ReportChartFields
    }
  }
  ${REPORT_CHART_FIELDS}
`;
