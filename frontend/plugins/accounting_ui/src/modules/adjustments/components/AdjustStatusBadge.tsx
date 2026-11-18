import { Badge, BadgeProps } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const ADJUST_STATUS_VARIANT: Record<string, BadgeProps['variant']> = {
  draft: 'secondary',
  running: 'info',
  process: 'warning',
  complete: 'default',
  publish: 'success',
};

export const getAdjustStatusVariant = (status?: string) =>
  (status && ADJUST_STATUS_VARIANT[status]) || 'secondary';

export const AdjustStatusBadge = ({ status }: { status?: string }) => {
  const { t } = useTranslation('accounting');

  if (!status) {
    return null;
  }

  return <Badge variant={getAdjustStatusVariant(status)}>{t(status)}</Badge>;
};
