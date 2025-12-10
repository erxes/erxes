import { ReportPageContainer, ReportTable } from 'erxes-ui';
import { ReportFilterCond } from '~/modules/journal-reports/components/ReportFilterCond';
import { ReportFooter } from '~/modules/journal-reports/components/ReportFooter';
import { ReportHeader } from '~/modules/journal-reports/components/ReportHeader';
import { ReportTableBody } from '~/modules/journal-reports/components/ReportTableBody';
import { ReportTableFooter } from '~/modules/journal-reports/components/ReportTableFooter';
import { ReportTableHeader } from '~/modules/journal-reports/components/ReportTableHeader';

export const GenJournalReport = () => {
  return (
    <ReportPageContainer>
      <ReportHeader />
      <ReportFilterCond />
      <ReportTable>
        <ReportTable.Header>
          <ReportTableHeader />
        </ReportTable.Header>
        <ReportTable.Body>
          <ReportTableBody />
        </ReportTable.Body>
        <ReportTable.Footer>
          <ReportTableFooter />
        </ReportTable.Footer>
      </ReportTable>
      <ReportFooter />
    </ReportPageContainer>
  );
};
