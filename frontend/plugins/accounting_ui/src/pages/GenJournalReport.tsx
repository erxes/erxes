import { ReportPageContainer } from 'erxes-ui';
import { ReportContent } from '~/modules/reports/components/ReportContent';
import { ReportFooter } from '~/modules/reports/components/ReportFooter';
import { ReportHeader } from '~/modules/reports/components/ReportHeader';

export const GenJournalReport = () => {
  return (
    <ReportPageContainer>
      <ReportHeader />
      <ReportContent />
      <ReportFooter />
    </ReportPageContainer>
  );
};
