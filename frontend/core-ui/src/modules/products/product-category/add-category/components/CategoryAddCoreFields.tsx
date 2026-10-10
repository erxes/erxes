import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input, Select } from 'erxes-ui';
import { SelectCategory } from '../../components/SelectCategory';
import { ACCOUNT_CATEGORY_MASK_TYPES } from './CategoryAddMoreFields';
import { ProductFormValues } from './formSchema';
import { useTranslation } from 'react-i18next';

interface ProductCategoriesAddCoreFieldsProps {
  form: UseFormReturn<ProductFormValues>;
}

export const ProductCategoriesAddCoreFields: React.FC<
  ProductCategoriesAddCoreFieldsProps
> = ({ form }) => {
  const { t } = useTranslation('product', {
    keyPrefix: 'product-category',
  });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  {t('label-name')} <span className="text-destructive">*</span>
                </Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
        <div className="flex-1">
          <Form.Field
            control={form.control}
            name="code"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  {t('label-code')} <span className="text-destructive">*</span>
                </Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
      </div>

      <Form.Field
        control={form.control}
        name="parentId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('parent-category')}</Form.Label>
            <Form.Control>
              <SelectCategory
                selected={field.value}
                onSelect={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="maskType"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('mask-type')}</Form.Label>
            <Select onValueChange={field.onChange} value={field.value}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder={t('choose-mask-type')}>
                    {ACCOUNT_CATEGORY_MASK_TYPES.filter(
                      (type) => type.value === field.value,
                    ).map((type) => t(type.labelKey))}
                  </Select.Value>
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {ACCOUNT_CATEGORY_MASK_TYPES.map((type) => (
                  <Select.Item key={type.value} value={type.value}>
                    {t(type.labelKey)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
