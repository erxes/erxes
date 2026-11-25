import { getReportFilterDefinitions } from '../reportFilters';
import { ReportRules } from '../reportsMap';

describe('journal report filter definitions', () => {
  it.each(Object.keys(ReportRules))(
    'offers detailed mode and company and team-member filters for the %s report',
    (report) => {
      const fields = getReportFilterDefinitions(report).map(
        (definition) => definition.field,
      );

      expect(fields).toContain('isMore');
      expect(fields).toEqual(
        expect.arrayContaining(['companyId', 'customerUserId']),
      );
    },
  );
});
