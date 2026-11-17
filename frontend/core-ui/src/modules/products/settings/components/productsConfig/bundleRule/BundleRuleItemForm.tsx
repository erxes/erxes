import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, Form, Input, Select, Sheet } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { IBundleRuleItem } from './types';
import { SelectProduct } from 'ui-modules';
import { ProductEditorHeader } from '@/products/components/ProductEditorPanel';
import { useBundleConditions } from '@/products/settings/hooks/useBundleConditions';

const bundleRuleItemSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  productIds: z.array(z.string()).min(1, 'At least one product is required'),
  priceType: z.string().min(1, 'Price type is required'),
  priceAdjustType: z.string().min(1, 'Price adjust type is required'),
  priceAdjustFactor: z.string().min(1, 'Price adjust factor is required'),
  quantity: z.number().min(1, 'Quantity is required'),
  percent: z.number().min(1, 'Percent is required'),
  allowSkip: z.boolean().optional(),
});

type TBundleRuleItemValues = z.infer<typeof bundleRuleItemSchema>;

interface IBundleRuleItemFormProps {
  // The row being edited; a new row starts empty.
  editingItem?: IBundleRuleItem;
  onSubmit: (data: TBundleRuleItemValues) => void;
  // Back to the rule, leaving its rows as they were.
  onCancel: () => void;
}

const toItemValues = (item?: IBundleRuleItem): TBundleRuleItemValues => ({
  code: item?.code ?? '',
  productIds: item?.productIds ?? [],
  priceType: item?.priceType ?? '',
  priceAdjustType: item?.priceAdjustType ?? 'none',
  priceAdjustFactor: item?.priceAdjustFactor ?? '',
  quantity: item?.quantity ?? 0,
  percent: item?.percent ?? 0,
  allowSkip: item?.allowSkip ?? false,
});

/**
 * A bundle rule's row, edited in the rule's panel in place of the rule;
 * Back or Cancel returns to it.
 */
export const BundleRuleItemForm = ({
  editingItem,
  onSubmit,
  onCancel,
}: IBundleRuleItemFormProps) => {
  const { t } = useTranslation('product', { keyPrefix: 'bundle-rules' });

  const itemForm = useForm<TBundleRuleItemValues>({
    defaultValues: toItemValues(editingItem),
    resolver: zodResolver(bundleRuleItemSchema),
  });

  const { bundleConditions } = useBundleConditions();

  const bundleConditionOptions =
    bundleConditions
      ?.filter((condition) => Boolean(condition?.code))
      .map((condition) => ({
        value: condition.code as string,
        label: condition.code as string,
      })) || [];

  const priceTypeOptions = [
    { value: 'thisProductPricePercent', label: 'thisProductPricePercent' },
    { value: 'mainPricePercent', label: 'mainPricePercent' },
    { value: 'price', label: 'price' },
  ];

  const priceAdjustTypeOptions = [
    { value: 'none', label: t('adjust-none') },
    { value: 'default', label: t('adjust-default') },
    { value: 'round', label: t('adjust-round') },
    { value: 'floor', label: t('adjust-floor') },
    { value: 'ceil', label: t('adjust-ceil') },
    { value: 'endsWith9', label: t('adjust-ends-with-9') },
  ];

  return (
    <Form {...itemForm}>
      <form
        onSubmit={itemForm.handleSubmit(onSubmit)}
        className="flex overflow-hidden flex-col h-full"
      >
        <ProductEditorHeader
          title={editingItem ? t('edit-item') : t('add-item')}
          onBack={onCancel}
        />
        <Sheet.Content className="min-h-0 overflow-y-auto flex-auto">
          <div className="flex flex-col gap-4 p-5 w-full">
            <Form.Field
              control={itemForm.control}
              name="code"
              render={({ field }) => (
                <Form.Item className="w-full">
                  <Form.Label>
                    {t('code')} <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Control>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value
                          placeholder={t('select-bundle-condition')}
                        />
                      </Select.Trigger>
                      <Select.Content>
                        {bundleConditionOptions.map((option) => (
                          <Select.Item key={option.value} value={option.value}>
                            {option.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={itemForm.control}
              name="productIds"
              render={({ field }) => (
                <Form.Item className="w-full">
                  <Form.Label>
                    {t('products')} <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Control>
                    <SelectProduct
                      mode="multiple"
                      value={field.value || []}
                      placeholder={t('choose-product-service')}
                      onValueChange={(value) =>
                        field.onChange(Array.isArray(value) ? value : [])
                      }
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={itemForm.control}
              name="priceType"
              render={({ field }) => (
                <Form.Item className="w-full">
                  <Form.Label>
                    {t('price-type')}{' '}
                    <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Control>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder={t('select-price-type')} />
                      </Select.Trigger>
                      <Select.Content>
                        {priceTypeOptions.map((option) => (
                          <Select.Item key={option.value} value={option.value}>
                            {option.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={itemForm.control}
              name="priceAdjustType"
              render={({ field }) => (
                <Form.Item className="w-full">
                  <Form.Label>
                    {t('price-adjust-type')}{' '}
                    <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Control>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value
                          placeholder={t('select-price-adjust-type')}
                        />
                      </Select.Trigger>
                      <Select.Content>
                        {priceAdjustTypeOptions.map((option) => (
                          <Select.Item key={option.value} value={option.value}>
                            {option.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={itemForm.control}
              name="priceAdjustFactor"
              render={({ field }) => (
                <Form.Item className="w-full">
                  <Form.Label>
                    {t('price-adjust-factor')}{' '}
                    <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Control>
                    <Input
                      type="number"
                      placeholder={t('price-adjust-factor')}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <div className="flex gap-2">
              <Form.Field
                control={itemForm.control}
                name="quantity"
                render={({ field }) => (
                  <Form.Item className="w-full">
                    <Form.Label>
                      {t('quantity')}{' '}
                      <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <Input
                        type="number"
                        placeholder={t('quantity')}
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(Number.parseFloat(e.target.value) || 0)
                        }
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={itemForm.control}
                name="percent"
                render={({ field }) => (
                  <Form.Item className="w-full">
                    <Form.Label>
                      {t('percent')} <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <Input
                        type="number"
                        placeholder={t('percent')}
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(Number.parseFloat(e.target.value) || 0)
                        }
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>

            <Form.Field
              control={itemForm.control}
              name="allowSkip"
              render={({ field }) => (
                <Form.Item className="flex gap-2 space-items-center">
                  <Form.Control>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </Form.Control>
                  <Form.Label className="mb-0">{t('allow-skip')}</Form.Label>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button type="submit">{editingItem ? t('update') : t('add')}</Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
