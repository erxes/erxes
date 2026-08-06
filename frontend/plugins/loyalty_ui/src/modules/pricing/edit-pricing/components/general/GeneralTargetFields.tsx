import { GeneralFormValues } from '@/pricing/edit-pricing/components/general/types';
import { normalizeMultipleValue } from '@/pricing/edit-pricing/components/general/utils';
import { PricingAppliesTo } from '@/pricing/types';
import { cn, Form } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  SelectCategory,
  SelectCompany,
  SelectProduct,
  SelectSegment,
  SelectTags,
} from 'ui-modules';

interface GeneralTargetFieldsProps {
  control: Control<GeneralFormValues>;
  appliesTo: PricingAppliesTo;
}

interface MultipleFieldProps<TName extends string> {
  control: Control<GeneralFormValues>;
  name: TName;
  label: string;
  className?: string;
}

const CategoryField = ({
  control,
  name,
  label,
  className,
}: MultipleFieldProps<'productCategoryIds' | 'excludeCategoryIds'>) => (
  <Form.Field
    control={control}
    name={name}
    render={({ field }) => (
      <Form.Item className={cn('min-w-0', className)}>
        <Form.Label>{label}</Form.Label>
        <Form.Control>
          <SelectCategory
            mode="multiple"
            value={field.value}
            onValueChange={(value) =>
              field.onChange(normalizeMultipleValue(value))
            }
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

const ProductField = ({
  control,
  name,
  label,
  className,
}: MultipleFieldProps<
  'excludeProductIds' | 'appliesProductIds' | 'bundleProductIds'
>) => (
  <Form.Field
    control={control}
    name={name}
    render={({ field }) => (
      <Form.Item className={cn('min-w-0', className)}>
        <Form.Label>{label}</Form.Label>
        <Form.Control>
          <SelectProduct
            mode="multiple"
            value={field.value}
            onValueChange={(value) =>
              field.onChange(normalizeMultipleValue(value))
            }
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

const TagField = ({
  control,
  name,
  label,
  className,
}: MultipleFieldProps<'productTagIds' | 'excludeTagIds'>) => (
  <Form.Field
    control={control}
    name={name}
    render={({ field }) => (
      <Form.Item className={cn('min-w-0', className)}>
        <Form.Label>{label}</Form.Label>
        <Form.Control>
          <SelectTags
            tagType="sales:product"
            mode="multiple"
            value={field.value}
            onValueChange={(value) =>
              field.onChange(normalizeMultipleValue(value))
            }
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const GeneralTargetFields = ({
  control,
  appliesTo,
}: GeneralTargetFieldsProps) => {
  const { t } = useTranslation('loyalty');

  if (appliesTo === 'category') {
    return (
      <>
        <CategoryField
          control={control}
          name="productCategoryIds"
          label={t('product-categories-label')}
          className="md:col-span-6"
        />
        <CategoryField
          control={control}
          name="excludeCategoryIds"
          label={t('exclude-categories')}
          className="md:col-span-6"
        />
        <ProductField
          control={control}
          name="excludeProductIds"
          label={t('exclude-products')}
          className="md:col-span-6"
        />
      </>
    );
  }

  if (appliesTo === 'product') {
    return (
      <ProductField
        control={control}
        name="appliesProductIds"
        label={t('products-label')}
        className="md:col-span-6"
      />
    );
  }

  if (appliesTo === 'segment') {
    return (
      <Form.Field
        control={control}
        name="segmentId"
        render={({ field }) => (
          <Form.Item className="min-w-0 md:col-span-6">
            <Form.Label>{t('segment-label')}</Form.Label>
            <Form.Control>
              <SelectSegment
                selected={field.value || undefined}
                onSelect={field.onChange}
                nullable
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    );
  }

  if (appliesTo === 'vendor') {
    return (
      <Form.Field
        control={control}
        name="vendorCompanyIds"
        render={({ field }) => (
          <Form.Item className="min-w-0 md:col-span-6">
            <Form.Label>{t('vendors')}</Form.Label>
            <Form.Control>
              <SelectCompany
                mode="multiple"
                value={field.value}
                onValueChange={(value) =>
                  field.onChange(normalizeMultipleValue(value))
                }
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    );
  }

  if (appliesTo === 'tag') {
    return (
      <>
        <TagField
          control={control}
          name="productTagIds"
          label={t('product-tags')}
          className="md:col-span-6"
        />
        <TagField
          control={control}
          name="excludeTagIds"
          label={t('exclude-tags')}
          className="md:col-span-6"
        />
        <ProductField
          control={control}
          name="excludeProductIds"
          label={t('exclude-products')}
          className="md:col-span-6"
        />
      </>
    );
  }

  return (
    <ProductField
      control={control}
      name="bundleProductIds"
      label={t('products-to-bundle')}
      className="md:col-span-6"
    />
  );
};
