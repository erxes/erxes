import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { VoucherFormValues } from '../../constants/voucherFormSchema';
import { SelectProduct } from 'ui-modules';

interface AddVoucherProductBonusFormProps {
  form: UseFormReturn<VoucherFormValues>;
}

export const AddVoucherProductBonusForm: React.FC<
  AddVoucherProductBonusFormProps
> = ({ form }) => {
  const { t } = useTranslation('loyalty');
  return (
    <div className="space-y-4 p-5">
      <Form.Field
        control={form.control}
        name="bonusProduct"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('bonus-product')}</Form.Label>
            <Form.Control>
              <SelectProduct
                value={field.value}
                onValueChange={(value) =>
                  field.onChange(Array.isArray(value) ? value[0] : value)
                }
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="bonusCount"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('bonus-count')}</Form.Label>
            <Form.Control>
              <Input
                type="number"
                placeholder={t('enter-bonus-count')}
                value={field.value ?? ''}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
