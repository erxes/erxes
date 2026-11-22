import { IconPackage, IconPercentage } from '@tabler/icons-react';
import { cn, Form, Input } from 'erxes-ui';
import {
  PosFieldList,
  PosFieldRow,
} from '@/pos/components/pos-edit/PosFieldRow';
import { POS_PANEL_INPUT_CLASS_NAME } from '@/pos/constants/posPanel';
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
    <PosFieldList>
      <Form.Field
        control={control}
        name="serviceCharge"
        render={({ field }) => (
          <PosFieldRow
            label={t('service-charge-percent')}
            icon={IconPercentage}
            asControl={false}
          >
            <div className="relative max-w-40">
              <Form.Control>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={field.value}
                  className={cn(POS_PANEL_INPUT_CLASS_NAME, 'w-full pr-8')}
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
              </Form.Control>
              <span className="absolute right-3 top-1/2 text-xs -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
          </PosFieldRow>
        )}
      />

      <Form.Field
        control={control}
        name="serviceChargeApplicableProductId"
        render={({ field }) => (
          <PosFieldRow label={t('applicable-products')} icon={IconPackage}>
            <SelectProduct
              mode="single"
              value={field.value}
              onValueChange={(value) => {
                const nextValue = Array.isArray(value)
                  ? value.at(0) ?? ''
                  : value ?? '';

                field.onChange(nextValue);
              }}
              placeholder={t('select-products-to-apply-service-charge')}
            />
          </PosFieldRow>
        )}
      />
    </PosFieldList>
  );
};
