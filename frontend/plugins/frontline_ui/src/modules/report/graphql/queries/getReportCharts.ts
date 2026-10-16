import { gql } from '~/gql';

export const REPORT_CHART_FIELDS = gql(`
  fragment ReportChartFields on ReportChart {
    _id
    name
    chartType
    visualType
    colSpan
    filters {
      statusChangedDate
      updatedAtDate
      description
      statusChangedByIds
      updatedByIds
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
      pageIds
      searchValue
      propertyIds
      priority
      propertyValueFilters {
        propertyId
        type
        values
      }
    }
  }
`);

export const GET_REPORT_CHARTS = gql(`
  query ReportCharts($chartType: String) {
    reportCharts(chartType: $chartType) {
      ...ReportChartFields
    }
  }
`);
