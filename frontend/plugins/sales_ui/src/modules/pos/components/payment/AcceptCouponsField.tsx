import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  PosSwitchList,
  PosSwitchRow,
} from '@/pos/components/pos-edit/PosSwitchRow';
import type { PaymentFormData } from './Payment';

export const AcceptCouponsField = ({
  control,
}: {
  control: Control<PaymentFormData>;
}) => {
  const { t } = useTranslation('sales');

  return (
    <PosSwitchList>
      <PosSwitchRow
        control={control}
        name="acceptCoupons"
        label={t('pos-accept-coupons')}
        description={t('pos-accept-coupons-hint')}
      />
    </PosSwitchList>
  );
};
