import { IconClipboardTextFilled } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { AccountingHeader } from '@/layout/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';
import { ReportForm } from '~/modules/journal-reports/components/ReportForm';
import { ReportsList } from '~/modules/journal-reports/components/ReportsList';
import { activeReportState } from '~/modules/journal-reports/states/renderingReportsStates';
import { TaxReportForm } from '~/modules/tax-reports/components/TaxReportForm';
import { getTaxReportKindFromListKey } from '~/modules/tax-reports/types';

export const JournalReports = () => {
  const { t } = useTranslation('accounting');
  const taxReportKind = getTaxReportKindFromListKey(
    useAtomValue(activeReportState),
  );

  return (
    <AccountingLayout>
      <div className="flex flex-auto overflow-hidden">
        <ReportsList />
        <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
          <AccountingHeader
            returnLink="/accounting/journal-reports"
            returnText={t('Reports')}
            icon={IconClipboardTextFilled}
          />
          <div className="flex flex-auto overflow-hidden">
            {taxReportKind ? (
              <TaxReportForm key={taxReportKind} kind={taxReportKind} />
            ) : (
              <ReportForm />
            )}
          </div>
        </div>
      </div>
    </AccountingLayout>
  );
};
