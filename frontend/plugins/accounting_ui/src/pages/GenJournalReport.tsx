import { ReportPageContainer, ReportTable } from 'erxes-ui';
import { useRef } from 'react';
import { ReportFilterCond } from '~/modules/journal-reports/components/ReportFilterCond';
import { ReportFooter } from '~/modules/journal-reports/components/ReportFooter';
import { ReportHeader } from '~/modules/journal-reports/components/ReportHeader';
import { ReportTableBody } from '~/modules/journal-reports/components/ReportTableBody';
import { ReportTableFooter } from '~/modules/journal-reports/components/ReportTableFooter';
import { ReportTableHeader } from '~/modules/journal-reports/components/ReportTableHeader';

export const GenJournalReport = () => {
  const reportContainerRef = useRef<HTMLDivElement>(null);

  return (
    <ReportPageContainer>
      <div ref={reportContainerRef}>
        <ReportHeader reportContainerRef={reportContainerRef} />
        <ReportFilterCond />
        <ReportTable>
          <ReportTable.Header>
            <ReportTableHeader />
          </ReportTable.Header>
          <ReportTableBody />
          <ReportTable.Footer>
            <ReportTableFooter />
          </ReportTable.Footer>
        </ReportTable>
        <ReportFooter />
      </div>
    </ReportPageContainer>
  );
};
