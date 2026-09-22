import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { VoucherFormValues } from '../../../constants/voucherFormSchema';
import { SelectCategory } from 'ui-modules';

interface VoucherAddRestrictionCoreFieldProps {
  form: UseFormReturn<VoucherFormValues>;
}

export const VoucherAddRestrictionCoreField: React.FC<
  VoucherAddRestrictionCoreFieldProps
> = ({ form }) => {
  const { t } = useTranslation('loyalty');
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <Form.Field
          control={form.control}
          name="minimumSpend"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('minimum-spend')}</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  placeholder={t('enter-minimum-spend')}
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === ''
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="categoryIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('product-category')}</Form.Label>
              <Form.Control>
                <SelectCategory
                  mode="multiple"
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(Array.isArray(value) ? value : [value])
                  }
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
      <div className="flex flex-col gap-4">
        <Form.Field
          control={form.control}
          name="maximumSpend"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('maximum-spend')}</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  placeholder={t('enter-maximum-spend')}
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === ''
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="excludeCategoryIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('or-exclude-product-category')}</Form.Label>
              <Form.Control>
                <SelectCategory
                  mode="multiple"
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(Array.isArray(value) ? value : [value])
                  }
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </div>
  );
};
