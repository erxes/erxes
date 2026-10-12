import { UseFormReturn } from 'react-hook-form';
import { useEffect } from 'react';
import { nanoid } from 'nanoid';
import { useTranslation } from 'react-i18next';
import { Form, Input, Select, Checkbox, Label } from 'erxes-ui';
import { ProductFormValues } from '@/products/product-category/add-category/components/formSchema';

export const ACCOUNT_CATEGORY_MASK_TYPES = [
  { labelKey: 'mask-any', value: 'any' },
  { labelKey: 'mask-soft', value: 'soft' },
  { labelKey: 'mask-hard', value: 'hard' },
  { labelKey: 'mask-all', value: 'all' },
];

export const PRODUCT_CATEGORIES_STATUS = [
  { labelKey: 'status-active', value: 'active' },
  { labelKey: 'status-disabled', value: 'disabled' },
  { labelKey: 'status-archived', value: 'archived' },
];

export const CategorySimilarityFields = ({
  form,
  fieldGroups = [],
  fields = [],
}: {
  form: UseFormReturn<ProductFormValues>;
  fieldGroups?: { _id: string; name: string }[];
  fields?: { _id: string; name: string; groupId?: string }[];
}) => {
  const { t } = useTranslation('product', {
    keyPrefix: 'product-category',
  });
  const isSimilarityChecked = form.watch('isSimilarity');
  const similarities = form.watch('similarities') || [];

  useEffect(() => {
    if (isSimilarityChecked && similarities.length === 0) {
      form.setValue('similarities', [
        {
          id: nanoid(),
          title: '',
          groupId: '',
          fieldId: '',
        },
      ]);
    }

    if (!isSimilarityChecked && similarities.length) {
      form.setValue('similarities', []);
    }
  }, [form, isSimilarityChecked, similarities.length]);

  const updateSimilarityRow = (
    id: string,
    key: 'title' | 'groupId' | 'fieldId',
    value: string,
  ) => {
    form.setValue(
      'similarities',
      similarities.map((item) =>
        item.id === id
          ? {
              ...item,
              [key]: value,
              ...(key === 'groupId' ? { fieldId: '' } : {}),
            }
          : item,
      ),
    );
  };

  return (
    <>
      <Form.Field
        control={form.control}
        name="isSimilarity"
        render={({ field }) => (
          <Form.Item className="mb-5">
            <Form.Control>
              <div className="flex gap-2 items-center">
                <Checkbox
                  id="isSimilarity"
                  checked={field.value || false}
                  onCheckedChange={(val) => field.onChange(!!val)}
                />

                <Label htmlFor="isSimilarity" className="cursor-pointer">
                  {t('has-similarities-group')}
                </Label>
              </div>
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      {isSimilarityChecked && (
        <div className="p-3 mb-5 space-y-3 rounded-lg border">
          {similarities.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="space-y-2">
                <Label>{t('title')}</Label>
                <Input
                  value={item.title || ''}
                  onChange={(e) =>
                    updateSimilarityRow(item.id, 'title', e.target.value)
                  }
                  placeholder={t('enter-title')}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Label>{t('field-group')}</Label>
                  <Select
                    value={item.groupId || ''}
                    onValueChange={(val) =>
                      updateSimilarityRow(item.id, 'groupId', val)
                    }
                  >
                    <Form.Control>
                      <Select.Trigger>
                        <Select.Value placeholder={t('field-group')} />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      {fieldGroups.map((group) => (
                        <Select.Item key={group._id} value={group._id}>
                          {group.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>

                <div className="flex-1 space-y-2">
                  <Label>{t('field')}</Label>
                  <Select
                    value={item.fieldId || ''}
                    onValueChange={(val) =>
                      updateSimilarityRow(item.id, 'fieldId', val)
                    }
                    disabled={!item.groupId}
                  >
                    <Form.Control>
                      <Select.Trigger>
                        <Select.Value placeholder={t('field')} />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      {fields
                        .filter(
                          (field) =>
                            !item.groupId || field.groupId === item.groupId,
                        )
                        .map((field) => (
                          <Select.Item key={field._id} value={field._id}>
                            {field.name}
                          </Select.Item>
                        ))}
                    </Select.Content>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export const CategoryStatusField = ({
  form,
}: {
  form: UseFormReturn<ProductFormValues>;
}) => {
  const { t } = useTranslation('product', {
    keyPrefix: 'product-category',
  });

  return (
    <Form.Field
      control={form.control}
      name="status"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('state')}</Form.Label>
          <Select onValueChange={field.onChange} value={field.value}>
            <Form.Control>
              <Select.Trigger>
                <Select.Value placeholder={t('choose-type')}>
                  {PRODUCT_CATEGORIES_STATUS.filter(
                    (type) => type.value === field.value,
                  ).map((type) => t(type.labelKey))}
                </Select.Value>
              </Select.Trigger>
            </Form.Control>
            <Select.Content>
              {PRODUCT_CATEGORIES_STATUS.map((type) => (
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
  );
};
