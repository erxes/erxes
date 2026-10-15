import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TVoucherStatus } from '../types/voucher';

const VARIANT: Record<
  TVoucherStatus,
  'default' | 'success' | 'warning' | 'destructive' | 'secondary'
> = {
  new: 'default',
  onhold: 'warning',
  used: 'success',
  cancelled: 'destructive',
  expired: 'secondary',
};

export const VoucherStatusBadge = ({ status }: { status: TVoucherStatus }) => {
  const { t } = useTranslation('loyalty');

  return (
    <Badge variant={VARIANT[status]}>{t(`voucher-status.${status}`)}</Badge>
  );
};
