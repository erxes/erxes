import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const LoyaltyDashboardViewAll = ({ to }: { to: string }) => {
  const { t } = useTranslation('loyalty');

  return (
    <Button variant="ghost" size="sm" asChild>
      <Link to={to}>{t('dashboard.view-all')}</Link>
    </Button>
  );
};
