import { useTranslation } from 'react-i18next';
import { Button, Empty } from 'erxes-ui';

export const TechCardListStatus = ({
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
          {error ? t('tech-card-list-load-failed') : t('tech-card-no-results')}
        </Empty.Description>
      </Empty.Header>
      {error && (
        <Empty.Content>
          <Button type="button" variant="secondary" onClick={retry}>
            {t('tech-card-retry')}
          </Button>
        </Empty.Content>
      )}
    </Empty>
  );
};
