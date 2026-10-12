import { UseFormReturn } from 'react-hook-form';
import { useEffect } from 'react';

import { Form, Input, Editor } from 'erxes-ui';

import { CategoryHotKeyScope } from '../../types/CategoryHotKeyScope';
import { ProductFormValues } from '../../add-category/components/formSchema';
import {
  ProductPrimaryImageUpload,
  SelectBrand,
  type ProductAttachmentItem,
  useFieldGroups,
  useFields,
} from 'ui-modules';
import { nanoid } from 'nanoid';
import { useTranslation } from 'react-i18next';
import {
  CategorySimilarityFields,
  CategoryStatusField,
} from '@/products/product-category/add-category/components/CategorySharedFields';

export {
  ACCOUNT_CATEGORY_MASK_TYPES,
  PRODUCT_CATEGORIES_STATUS,
} from '@/products/product-category/add-category/components/CategorySharedFields';

export const CategoryUpdateMoreFields = ({
  form,
  categoryDetail,
  attachment,
  onAttachmentChange,
}: {
  form: UseFormReturn<ProductFormValues>;
  categoryDetail?: any;
  attachment?: ProductAttachmentItem | null;
  onAttachmentChange?: (attachment: ProductAttachmentItem | null) => void;
}) => {
  const { t } = useTranslation('product', {
    keyPrefix: 'product-category',
  });
  const { fieldGroups } = useFieldGroups({ contentType: 'core:product' });
  const { fields } = useFields({ contentType: 'core:product' });

  useEffect(() => {
    if (categoryDetail) {
      form.reset((prevValues) => ({
        ...prevValues,
        meta: categoryDetail.meta || '',
        scopeBrandIds: categoryDetail.scopeBrandIds || [],
        description: categoryDetail.description || '',
        attachment: categoryDetail.attachment || null,
        maskType: categoryDetail.maskType || '',
        status: categoryDetail.status || '',
        isSimilarity: !!categoryDetail.isSimilarity,
        similarities: (categoryDetail.similarities || []).map((item: any) => ({
          id: item.id || nanoid(),
          title: item.title || '',
          groupId: item.groupId || '',
          fieldId: item.fieldId || '',
        })),
      }));
    }
  }, [categoryDetail, form]);

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
                value={field.value || []}
                onValueChange={field.onChange}
                mode="multiple"
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
                key={categoryDetail?._id || 'category-description'}
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
