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
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <IconCurrencyTugrik size={20} />
        Payment Information
      </h3>

      <div className={showPremiumDisplay ? 'grid grid-cols-2 gap-4' : ''}>
        <div>
          <label className="block text-sm font-medium mb-2">
            Payment Method *
          </label>
          <Select value={paymentKind} onValueChange={onPaymentKindChange}>
            <Select.Trigger>
              <Select.Value placeholder="Select" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="cash">Cash</Select.Item>
              <Select.Item value="qpay">QPay</Select.Item>
            </Select.Content>
          </Select>
        </div>

        {showPremiumDisplay && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Amount ($)
            </label>
            <div className="p-3 bg-gray-50 border rounded-md">
              <p className="text-lg font-semibold">
                {calculatedPremium > 0
                  ? calculatedPremium.toLocaleString()
                  : '0'}{' '}
                ₮
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Automatically calculated
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
