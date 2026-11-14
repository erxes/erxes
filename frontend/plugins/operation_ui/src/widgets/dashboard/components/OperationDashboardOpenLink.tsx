import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const OperationDashboardOpenLink = ({ to }: { to?: string | null }) => {
  const { t } = useTranslation('operation');

  if (!to) {
    return null;
  }

  return (
    <Button variant="ghost" size="sm" asChild>
      <Link to={to}>{t('dashboard.open')}</Link>
    </Button>
  );
};
