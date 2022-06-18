export const types = `
  type DailyReport {
    report: JSON
  }
`;

export const queries = `
  dailyReport(posUserIds: [String], posNumber: String): DailyReport
`;
