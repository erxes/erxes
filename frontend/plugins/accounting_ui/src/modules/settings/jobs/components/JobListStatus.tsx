import { useTranslation } from 'react-i18next';
import { IconAlertCircle } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';

export const JobListStatus = ({
  error,
  retry,
}: {
  error?: Error;
  retry: () => void;
}) => {
  const { t } = useTranslation('accounting');

  if (!error) {
    return <AccountingEmptyState description={t('job-no-results')} />;
  }

  return (
    <AccountingEmptyState
      icon={IconAlertCircle}
      title={t('error')}
      description={t('job-list-load-failed')}
      action={
        <Button type="button" variant="secondary" onClick={retry}>
          {t('job-retry')}
        </Button>
      }
    />
  );
};
