import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const variantOf = (status: string) => {
  if (status === 'active') {
    return 'success';
  }

  if (status === 'pending' || status.startsWith('pending_')) {
    return 'warning';
  }

  return 'destructive';
};

export const CustomDomainStatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation('frontline');

  const label = status.replace(/_/g, ' ');

  return (
    <Badge variant={variantOf(status)} className="uppercase">
      {t(`customdomain-status-${status}`, label)}
    </Badge>
  );
};
