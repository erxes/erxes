import { ReportPageContainer } from 'erxes-ui';
import { useRef } from 'react';
import { ReportFooter } from '~/modules/journal-reports/components/ReportFooter';
import { TaxReportBody } from '~/modules/tax-reports/components/TaxReportBody';
import { TaxReportHeader } from '~/modules/tax-reports/components/TaxReportHeader';
import { useTaxReportData } from '~/modules/tax-reports/hooks/useTaxReportData';

export const GenTaxReport = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { kind, isValid, rows, loading, error } = useTaxReportData();

  return (
    <ReportPageContainer>
      <div ref={containerRef}>
        <TaxReportHeader
          kind={kind}
          containerRef={containerRef}
          canExport={isValid && !loading && !error && rows.length > 0}
        />
        <TaxReportBody
          rows={rows}
          loading={loading}
          error={
            error ||
            (isValid ? undefined : new Error('tax-report-invalid-link'))
          }
        />
        <ReportFooter />
      </div>
    </ReportPageContainer>
  );
};
