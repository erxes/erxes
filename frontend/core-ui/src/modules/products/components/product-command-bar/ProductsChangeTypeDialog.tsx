import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, Form, Input, Select, Spinner } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectProductType } from 'ui-modules';
import {
  productTypeChangeSchema,
  PRODUCT_TYPE_CHANGE_DURATION_UNITS,
} from '@/products/constants/productTypeChangeSchema';
import { useProductsChangeType } from '@/products/hooks/useProductsChangeType';
import type {
  ProductsChangeTypeDialogProps,
  ProductTypeChangeValues,
} from '@/products/types/productTypeChange';

export const ProductsChangeTypeDialog = ({
  products,
  open,
  onOpenChange,
}: ProductsChangeTypeDialogProps) => {
  const { t } = useTranslation('product');
  const { apply, saving } = useProductsChangeType(products);
  const form = useForm<ProductTypeChangeValues>({
    resolver: zodResolver(productTypeChangeSchema),
    shouldUnregister: true,
  });
  const isUnique = form.watch('type') === 'unique';
  const editableCount = products.filter((p) => p.status !== 'deleted').length;
  const skippedCount = products.length - editableCount;

  return (
    <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>{t('bulk.change-type', 'Change type')}</Dialog.Title>
          <Dialog.Description>
            {t(
              'bulk.change-type-description',
              'Change the type of {{count}} selected products.',
              { count: editableCount },
            )}
            {!!skippedCount &&
              ` ${t(
                'bulk.type-deleted-skipped',
                '{{count}} deleted products will be skipped.',
                { count: skippedCount },
              )}`}
          </Dialog.Description>
        </Dialog.Header>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              if (await apply(values)) onOpenChange(false);
            })}
          >
            <fieldset disabled={saving} className="space-y-4">
              <Form.Field
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('type', 'Type')}</Form.Label>
                    <SelectProductType
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      inForm
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
              {isUnique && (
                <>
                  <Form.Field
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('duration', 'Duration')}</Form.Label>
                        <Form.Control>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="any"
                            value={field.value ?? ''}
                            onChange={(event) =>
                              field.onChange(
                                event.target.value === ''
                                  ? undefined
                                  : Number(event.target.value),
                              )
                            }
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="durationType"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          {t('duration-type', 'Duration type')}
                        </Form.Label>
                        <Select
                          value={field.value ?? ''}
                          onValueChange={field.onChange}
                        >
                          <Form.Control>
                            <Select.Trigger>
                              <Select.Value
                                placeholder={t(
                                  'duration-type',
                                  'Duration type',
                                )}
                              />
                            </Select.Trigger>
                          </Form.Control>
                          <Select.Content>
                            {PRODUCT_TYPE_CHANGE_DURATION_UNITS.map((unit) => (
                              <Select.Item
                                key={unit}
                                value={unit}
                                className="capitalize"
                              >
                                {t(`duration-unit-${unit}`, unit)}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </>
              )}
            </fieldset>
            <Dialog.Footer>
              <Button
                type="button"
                variant="secondary"
                disabled={saving}
                onClick={() => onOpenChange(false)}
              >
                {t('cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={saving || !editableCount}>
                {saving && (
                  <Spinner containerClassName="inline-flex flex-none" />
                )}
                {t('bulk.change-type', 'Change type')}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};
