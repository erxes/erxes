import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CouponFormValues } from '../../../constants/couponFormSchema';
import { SelectProduct, SelectTags } from 'ui-modules';

interface CouponAddRestrictionMoreFieldsProps {
  form: UseFormReturn<CouponFormValues>;
}

export const CouponAddRestrictionMoreFields: React.FC<
  CouponAddRestrictionMoreFieldsProps
> = ({ form }) => {
  const { t } = useTranslation('loyalty');
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <Form.Field
          control={form.control}
          name="productIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('product')}</Form.Label>
              <Form.Control>
                <SelectProduct
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
        <Form.Field
          control={form.control}
          name="tag"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('tag')}</Form.Label>
              <Form.Control>
                <SelectTags
                  mode="multiple"
                  value={field.value || []}
                  onValueChange={(value) => field.onChange(value)}
                  tagType="tag"
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
          name="excludeProductIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('or-exclude-product')}</Form.Label>
              <Form.Control>
                <SelectProduct
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
        <Form.Field
          control={form.control}
          name="orExcludeTag"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('or-exclude-tag')}</Form.Label>
              <Form.Control>
                <SelectTags
                  mode="multiple"
                  value={field.value || []}
                  onValueChange={(value) => field.onChange(value)}
                  tagType="tags"
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
