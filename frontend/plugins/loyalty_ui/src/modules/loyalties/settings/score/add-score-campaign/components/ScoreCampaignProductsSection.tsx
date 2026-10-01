import { Form } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectCategory, SelectProduct, SelectTags } from 'ui-modules';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';

export const ScoreCampaignProductsSection = ({
  form,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
}) => {
  const { t } = useTranslation('loyalty');

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {t('score-campaign-products-hint')}
      </p>
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
