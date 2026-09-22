import { Form, Input, Label } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { type Control } from 'react-hook-form';
import { SelectProduct } from 'ui-modules';
import { type ProductsFormData } from '@/pos/components/products/Products';

interface ServiceChargeProps {
  control: Control<ProductsFormData>;
}

const normalizeServiceCharge = (value: string) => {
  if (value === '') {
    return '';
  }

  if (!/^\d*\.?\d*$/.test(value)) {
    return null;
  }

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    return null;
  }

  const clampedValue = Math.min(100, Math.max(0, parsedValue));
  return String(Math.round(clampedValue * 100) / 100);
};

export const ServiceCharge: React.FC<ServiceChargeProps> = ({ control }) => {
  const { t } = useTranslation('sales');
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Form.Field
        control={control}
        name="serviceCharge"
        render={({ field }) => (
          <Form.Item>
            <Label htmlFor="serviceCharge">{t('service-charge-percent')}</Label>

            <Form.Control>
              <div className="relative">
                <Input
                  id="serviceCharge"
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={field.value}
                  className="pr-8 w-full"
                  placeholder="0 - 100"
                  onChange={(event) => {
                    const nextValue = normalizeServiceCharge(
                      event.target.value,
                    );

                    if (nextValue !== null) {
                      field.onChange(nextValue);
                    }
                  }}
                />

                <span className="absolute right-3 top-1/2 text-sm -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
            </Form.Control>
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="serviceChargeApplicableProductId"
        render={({ field }) => (
          <Form.Item>
            <Label>{t('applicable-products')}</Label>

            <Form.Control>
              <SelectProduct
                mode="single"
                value={field.value}
                onValueChange={(value) => {
                  const nextValue = Array.isArray(value)
                    ? (value.at(0) ?? '')
                    : (value ?? '');

                  field.onChange(nextValue);
                }}
                placeholder={t('select-products-to-apply-service-charge')}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
    </div>
  );
};
