import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input, Textarea } from 'erxes-ui';
import { SelectCategory, SelectProduct, SelectTags } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';

interface LoyaltyScoreAddCoreFieldsProps {
  form: UseFormReturn<LoyaltyScoreFormValues>;
}

export const LoyaltyScoreAddCoreFields: React.FC<
  LoyaltyScoreAddCoreFieldsProps
> = ({ form }) => {
  const { t } = useTranslation('loyalty');
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-[1fr_120px] gap-4">
        <Form.Field
          control={form.control}
          name="title"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('title')}</Form.Label>
              <Form.Control>
                <Input {...field} placeholder={t('enter-title')} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="order"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('order')}</Form.Label>
              <Form.Control>
                <Input
                  {...field}
                  type="number"
                  placeholder="0"
                  value={field.value ?? ''}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('description')}</Form.Label>
            <Form.Control>
              <Textarea
                {...field}
                placeholder={t('enter-description')}
                className="min-h-[80px]"
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <Form.Field
            control={form.control}
            name="conditions.productCategoryIds"
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

          <Form.Field
            control={form.control}
            name="conditions.productIds"
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
            name="conditions.tagIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('tag')}</Form.Label>
                <Form.Control>
                  <SelectTags
                    mode="multiple"
                    value={field.value || []}
                    onValueChange={(value) =>
                      field.onChange(Array.isArray(value) ? value : [])
                    }
                    tagType="tags"
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
            name="conditions.excludeProductCategoryIds"
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

          <Form.Field
            control={form.control}
            name="conditions.excludeProductIds"
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
            name="conditions.excludeTagIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('or-exclude-tag')}</Form.Label>
                <Form.Control>
                  <SelectTags
                    mode="multiple"
                    value={field.value || []}
                    onValueChange={(value) =>
                      field.onChange(Array.isArray(value) ? value : [])
                    }
                    tagType="tags"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
      </div>
    </div>
  );
};
