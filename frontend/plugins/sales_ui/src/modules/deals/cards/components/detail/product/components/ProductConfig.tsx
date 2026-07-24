import { SelectCategory, SelectProduct } from 'ui-modules';

import { Form } from 'erxes-ui';
import { OtherPaymentsField, PaymentIdsField } from '@/payments';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { TPipelineForm } from '@/deals/types/pipelines';

interface ProductConfigProps {
  form: UseFormReturn<TPipelineForm>;
}

export const ProductConfig = ({ form }: ProductConfigProps) => {
  const { t } = useTranslation('sales');
  const { control } = form;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground">
            {t('initial-product-categories')}
          </h3>
        </div>
        <Form.Field
          control={control}
          name="initialCategoryIds"
          render={({ field }) => {
            return (
              <SelectCategory
                mode="multiple"
                value={field.value || []}
                onValueChange={field.onChange}
                placeholder={t('select-initial-product-categories')}
              />
            );
          }}
        />
      </div>
      <div>
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground">
            {t('pipeline-exclude-products')}
          </h3>
        </div>
        <div className="space-y-6">
          <Form.Field
            control={control}
            name="excludeCategoryIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="text-sm font-medium">
                  {t('exclude-categories')}
                </Form.Label>
                <SelectCategory
                  mode="multiple"
                  value={field.value || []}
                  onValueChange={field.onChange}
                  placeholder={t('select-categories-to-exclude')}
                />
              </Form.Item>
            )}
          />
          <Form.Field
            control={control}
            name="excludeProductIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="text-sm font-medium">
                  {t('exclude-products')}
                </Form.Label>
                <SelectProduct
                  mode="multiple"
                  value={field.value || []}
                  onValueChange={field.onChange}
                  placeholder={t('select-products-to-exclude')}
                />
              </Form.Item>
            )}
          />
        </div>
      </div>
      <div>
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground">
            {t('other-configuration')}
          </h3>
        </div>
        <div className="space-y-6">
          <PaymentIdsField control={form.control} />
          <OtherPaymentsField control={form.control} />
        </div>
      </div>
    </div>
  );
};
