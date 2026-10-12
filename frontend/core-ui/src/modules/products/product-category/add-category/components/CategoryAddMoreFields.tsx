import { UseFormReturn } from 'react-hook-form';

import { Form, Input, Editor } from 'erxes-ui';
import {
  ProductPrimaryImageUpload,
  SelectBrand,
  type ProductAttachmentItem,
} from 'ui-modules';
import { ProductFormValues } from './formSchema';
import { CategoryHotKeyScope } from '../../types/CategoryHotKeyScope';
import { useTranslation } from 'react-i18next';
import {
  CategorySimilarityFields,
  CategoryStatusField,
} from '@/products/product-category/add-category/components/CategorySharedFields';

export {
  ACCOUNT_CATEGORY_MASK_TYPES,
  PRODUCT_CATEGORIES_STATUS,
} from '@/products/product-category/add-category/components/CategorySharedFields';

export const ProductCategoryAddMoreFields = ({
  form,
  attachment,
  onAttachmentChange,
  fieldGroups = [],
  fields = [],
}: {
  form: UseFormReturn<ProductFormValues>;
  attachment?: ProductAttachmentItem | null;
  onAttachmentChange?: (attachment: ProductAttachmentItem | null) => void;
  fieldGroups?: { _id: string; name: string }[];
  fields?: { _id: string; name: string; groupId?: string }[];
}) => {
  const { t } = useTranslation('product', {
    keyPrefix: 'product-category',
  });

  return (
    <>
      <div className="flex items-center my-4">
        <div className="flex-1 border-t" />
        <Form.Label className="mx-2">{t('more-info')}</Form.Label>
        <div className="flex-1 border-t" />
      </div>
      <Form.Field
        control={form.control}
        name="meta"
        render={({ field }) => (
          <Form.Item className="mb-5">
            <Form.Label>{t('label-meta')}</Form.Label>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="scopeBrandIds"
        render={({ field }) => (
          <Form.Item className="flex flex-col mb-5">
            <Form.Label>{t('label-brand')}</Form.Label>
            <Form.Control>
              <SelectBrand
                value={field.value?.[0] || ''}
                onValueChange={(brandId) => {
                  field.onChange([brandId]);
                }}
              />
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <Form.Item className="mb-5">
            <Form.Label>{t('label-description')}</Form.Label>
            <Form.Control>
              <Editor
                initialContent={field.value}
                onChange={field.onChange}
                scope={CategoryHotKeyScope.CategoryAddSheetDescriptionField}
              />
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />

      <CategorySimilarityFields
        form={form}
        fieldGroups={fieldGroups}
        fields={fields}
      />

      <Form.Field
        control={form.control}
        name="attachment"
        render={() => (
          <Form.Item className="mb-5">
            <Form.Label>{t('label-upload')}</Form.Label>
            <Form.Control>
              <ProductPrimaryImageUpload
                value={attachment}
                onChange={(value) => onAttachmentChange?.(value)}
              />
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />

      <CategoryStatusField form={form} />
    </>
  );
};
