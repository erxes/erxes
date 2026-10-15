import { useTranslation } from 'react-i18next';
import { AccountingHeader } from '@/layout/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';
import { ReportForm } from '~/modules/journal-reports/components/ReportForm';
import { ReportsList } from '~/modules/journal-reports/components/ReportsList';

export const JournalReports = () => {
  const { t } = useTranslation('accounting');
  return (
    <AccountingLayout>
      <div className="flex flex-auto overflow-hidden">
        <ReportsList />
        <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
          <AccountingHeader
            returnLink="/accounting/journal-reports"
            returnText={t('Reports')}
          />
          <div className="flex flex-auto overflow-hidden">
            <ReportForm />
          </div>
        </div>
      </div>
    </AccountingLayout>
  );
};
