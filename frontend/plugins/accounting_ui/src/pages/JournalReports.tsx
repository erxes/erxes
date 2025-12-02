import { AccountingHeader } from '@/layout/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';
import { Resizable } from 'erxes-ui';
import { ReportForm } from '~/modules/journal-reports/components/ReportForm';
import { ReportsList } from '~/modules/journal-reports/components/ReportsList';

export const JournalReports = () => {
  return (
    <AccountingLayout>
      <AccountingHeader returnLink='/accounting/journal-reports' returnText='Reports' />
      <Resizable.PanelGroup
        direction="horizontal"
        className="flex-1 overflow-hidden"
      >
        <Resizable.Panel
          minSize={10}
          defaultSize={25}
          maxSize={30}
          className="hidden sm:flex min-w-80 max-w-lg"
        >
          <ReportsList />
        </Resizable.Panel>
        <Resizable.Handle />
        <Resizable.Panel minSize={70} defaultSize={75} maxSize={90}>
          <ReportForm />
        </Resizable.Panel>
      </Resizable.PanelGroup>
    </AccountingLayout>
  );
};
