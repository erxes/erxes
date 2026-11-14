import { Alert } from 'erxes-ui';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export const FxaAccountMatchingWarning = ({ message }: { message: string }) => {
  const { t } = useTranslation('accounting');
  return (
    <Alert variant="warning" className="mt-4">
      <IconAlertTriangle />
      <Alert.Title>{t('warning')}</Alert.Title>
      <Alert.Description>
        {message}{' '}
        <Link
          className="underline underline-offset-2"
          to="/accounting/settings/fixed-assets/accounts-config"
          target="_blank"
          rel="noreferrer"
        >
          {t('fxa-configure-account-links', {
            defaultValue: 'Дансны холбоос тохируулах',
          })}
        </Link>
      </Alert.Description>
    </Alert>
  );
};
