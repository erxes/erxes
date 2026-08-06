import { gql } from '@apollo/client';

export const DASHBOARD_SUMMARY = gql`
  query DashboardSummary($filters: JSON) {
    dashboardSummary(filters: $filters) {
      totalDeals { current previous percentChange }
      wonDeals { current previous percentChange }
      lostDeals { current previous percentChange }
      conversionRate { current previous percentChange }
      expectedRevenue { current previous percentChange }
    }
  }
`;

export const FORECAST_REVENUE = gql`
  query ForecastRevenue($filters: JSON) {
    forecastRevenue(filters: $filters) {
      totalForecast
      byStage { stageName forecast }
      byProbability { bucket forecast }
    }
  }
`;

export const DEALS_BY_STAGE = gql`
  query DealsByStage($filters: JSON, $sort: String, $limit: Int, $skip: Int) {
    dealsByStage(filters: $filters, sort: $sort, limit: $limit, skip: $skip) {
      stageId
      stageName
      totalCount
      deals
    }
  }
`;

export const USER_WIDGETS = gql`
  query UserWidgets {
    userWidgets {
      _id
      name
      chartType
      filters
      position
      createdAt
      updatedAt
    }
  }
`;

export const DEAL_REPORT = gql`
  query DealReport($chartType: String!, $filters: JSON) {
    dealReports(chartType: $chartType, filters: $filters) {
      labels
      datasets { label data }
    }
  }
`;

export const EXPORT_DEAL_REPORT = gql`
  query ExportDealReport($chartType: String!, $filters: JSON, $format: String) {
    exportDealReport(chartType: $chartType, filters: $filters, format: $format) {
      success
      content
      filename
    }
  }
`;