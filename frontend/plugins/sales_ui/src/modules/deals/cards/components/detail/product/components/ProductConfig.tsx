import { SelectCategory, SelectProduct } from 'ui-modules';
import { useState } from 'react';
import { MoreOptionsButton } from '@/pos/components/MoreOptionsButton';

import { ProductTagSelect } from '@/productFilters/ProductTagSelect';
import { useProductFilterLabels } from '@/productFilters/useProductFilterLabels';
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
  const filterLabels = useProductFilterLabels();
  const [showMore, setShowMore] = useState(false);
  const moreOptions = (
    <MoreOptionsButton
      showMore={showMore}
      onToggle={() => setShowMore((previous) => !previous)}
    />
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 items-end gap-x-4 gap-y-6">
        <Form.Field
          control={control}
          name="initialCategoryIds"
          render={({ field }) => (
            <Form.Item className="min-w-0">
              <Form.Label>{t('initial-product-categories')}</Form.Label>
              <SelectCategory
                mode="multiple"
                value={field.value || []}
                onValueChange={field.onChange}
                placeholder={t('select-initial-product-categories')}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        {!showMore && <div>{moreOptions}</div>}
        {showMore && (
          <>
            <Form.Field
              control={control}
              name="excludeCategoryIds"
              render={({ field }) => (
                <Form.Item className="min-w-0">
                  <Form.Label>{t('exclude-categories')}</Form.Label>
                  <SelectCategory
                    mode="multiple"
                    value={field.value || []}
                    onValueChange={field.onChange}
                    placeholder={t('select-categories-to-exclude')}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name="tagIds"
              render={({ field }) => (
                <Form.Item className="min-w-0">
                  <Form.Label>{filterLabels.tags}</Form.Label>
                  <ProductTagSelect
                    value={field.value || []}
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name="excludeTagIds"
              render={({ field }) => (
                <Form.Item className="min-w-0">
                  <Form.Label>{filterLabels.excludeTags}</Form.Label>
                  <ProductTagSelect
                    value={field.value || []}
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name="productIds"
              render={({ field }) => (
                <Form.Item className="min-w-0">
                  <Form.Label>{filterLabels.products}</Form.Label>
                  <SelectProduct
                    mode="multiple"
                    value={field.value || []}
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name="excludeProductIds"
              render={({ field }) => (
                <Form.Item className="min-w-0">
                  <Form.Label>{t('exclude-products')}</Form.Label>
                  <SelectProduct
                    mode="multiple"
                    value={field.value || []}
                    onValueChange={field.onChange}
                    placeholder={t('select-products-to-exclude')}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <p className="col-span-2 text-sm text-muted-foreground">
              {filterLabels.description}
            </p>
            <div className="col-span-2">{moreOptions}</div>
          </>
        )}
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
