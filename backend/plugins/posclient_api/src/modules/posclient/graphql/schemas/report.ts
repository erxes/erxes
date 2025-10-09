export const types = `
  type DailyReport {
    report: JSON
  }
`;

export const queries = `
  dailyReport(posUserIds: [String], dateType: String, startDate: Date, endDate: Date): DailyReport
`;
