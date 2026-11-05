import { useTranslation } from 'react-i18next';
import { Button, Empty } from 'erxes-ui';

export const JobListStatus = ({
  error,
  retry,
}: {
  error?: Error;
  retry: () => void;
}) => {
  const { t } = useTranslation('accounting');
  return (
    <Empty role={error ? 'alert' : 'status'}>
      <Empty.Header>
        <Empty.Description>
          {error ? t('job-list-load-failed') : t('job-no-results')}
        </Empty.Description>
      </Empty.Header>
      {error && (
        <Empty.Content>
          <Button type="button" variant="secondary" onClick={retry}>
            {t('job-retry')}
          </Button>
        </Empty.Content>
      )}
    </Empty>
  );
};
