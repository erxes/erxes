export const types = `
  type DealReportDataset {
    data: [Float]
    label: String
  }

  type DealReportData {
    labels: [String]
    datasets: [DealReportDataset]
  }

  extend type Query {
    dealReports(
      chartType: String!
      filters: JSON
    ): DealReportData
  }
`;

export const queries = ``;