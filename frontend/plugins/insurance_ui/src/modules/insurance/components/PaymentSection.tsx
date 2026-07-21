import { useTranslation } from 'react-i18next';
import { IconCurrencyTugrik } from '@tabler/icons-react';
import { Select } from 'erxes-ui';

interface PaymentSectionProps {
  paymentKind: string;
  onPaymentKindChange: (value: string) => void;
  calculatedPremium?: number;
  showPremiumDisplay?: boolean;
}

export const PaymentSection = ({
  paymentKind,
  onPaymentKindChange,
  calculatedPremium = 0,
  showPremiumDisplay = false,
}: PaymentSectionProps) => {
  const { t } = useTranslation('insurance');
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <IconCurrencyTugrik size={20} />
        {t('payment-information', 'Payment Information')}
      </h3>

      <div className={showPremiumDisplay ? 'grid grid-cols-2 gap-4' : ''}>
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('payment-method-required', 'Payment Method *')}
          </label>
          <Select value={paymentKind} onValueChange={onPaymentKindChange}>
            <Select.Trigger>
              <Select.Value placeholder={t('select', 'Select')} />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="cash">{t('cash', 'Cash')}</Select.Item>
              <Select.Item value="qpay">{t('qpay', 'QPay')}</Select.Item>
            </Select.Content>
          </Select>
        </div>

        {showPremiumDisplay && (
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('payment-amount', 'Payment Amount ($)')}
            </label>
            <div className="p-3 bg-gray-50 border rounded-md">
              <p className="text-lg font-semibold">
                {calculatedPremium > 0
                  ? calculatedPremium.toLocaleString()
                  : '0'}{' '}
                ₮
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('automatically-calculated', 'Automatically calculated')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
