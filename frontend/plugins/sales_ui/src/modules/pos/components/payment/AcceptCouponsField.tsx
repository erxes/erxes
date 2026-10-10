import { Checkbox, Form, Label } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { PaymentFormData } from './Payment';

// Off hides the coupon input at the till.
export const AcceptCouponsField = ({
  control,
}: {
  control: Control<PaymentFormData>;
}) => {
  const { t } = useTranslation('sales');

  return (
    <Form.Field
      control={control}
      name="acceptCoupons"
      render={({ field }) => (
        <Form.Item>
          <div className="flex items-center gap-2">
            <Form.Control>
              <Checkbox
                id="acceptCoupons"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            </Form.Control>
            <Label htmlFor="acceptCoupons">{t('pos-accept-coupons')}</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('pos-accept-coupons-hint')}
          </p>
        </Form.Item>
      )}
    />
  );
};
