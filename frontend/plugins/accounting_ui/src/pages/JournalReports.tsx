import { AccountingHeader } from '@/layout/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';
import { ReportForm } from '~/modules/journal-reports/components/ReportForm';
import { ReportsList } from '~/modules/journal-reports/components/ReportsList';

export const JournalReports = () => {
  return (
    <AccountingLayout>
      <AccountingHeader returnLink='/accounting/journal-reports' returnText='Reports' />
      <div className="flex flex-auto overflow-hidden">
        <ReportsList />
        <ReportForm />
      </div >
    </AccountingLayout>
  );
};
