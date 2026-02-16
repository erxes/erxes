import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Sheet, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { SelectCategory, SelectProduct, SelectTags } from 'ui-modules';
import { useProductRulesAdd } from '@/products/settings/hooks/useProductRulesAdd';
import { useProductRulesEdit } from '@/products/settings/hooks/useProductRulesEdit';
import { IProductRule } from './types';

const productRuleFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  unitPrice: z.coerce
    .number()
    .min(0, 'Unit price must be greater than or equal to 0'),
  bundleId: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  excludeCategoryIds: z.array(z.string()).optional(),
  productIds: z.array(z.string()).optional(),
  excludeProductIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  excludeTagIds: z.array(z.string()).optional(),
});

interface IProductRuleFormProps {
  productRule?: IProductRule;
  onOpenChange?: (open: boolean) => void;
}

export const ProductRuleForm = ({
  productRule,
  onOpenChange,
}: IProductRuleFormProps) => {
  const { toast } = useToast();
  const { t } = useTranslation('product', { keyPrefix: 'add' });
  const { productRulesAdd, loading: loadingAdd } = useProductRulesAdd();
  const { productRulesEdit, loading: loadingEdit } = useProductRulesEdit();

  const form = useForm<z.infer<typeof productRuleFormSchema>>({
    defaultValues: productRule
      ? {
          name: productRule.name,
          unitPrice: productRule.unitPrice,
          bundleId: productRule.bundleId || '',
          categoryIds: productRule.categoryIds || [],
          excludeCategoryIds: productRule.excludeCategoryIds || [],
          productIds: productRule.productIds || [],
          excludeProductIds: productRule.excludeProductIds || [],
          tagIds: productRule.tagIds || [],
          excludeTagIds: productRule.excludeTagIds || [],
        }
      : {
          name: '',
          unitPrice: 0,
          bundleId: '',
          categoryIds: [],
          excludeCategoryIds: [],
          productIds: [],
          excludeProductIds: [],
          tagIds: [],
          excludeTagIds: [],
        },
    resolver: zodResolver(productRuleFormSchema),
  });

  const handleCancel = () => {
    form.reset();
    onOpenChange?.(false);
  };

  const onSubmit = (data: z.infer<typeof productRuleFormSchema>) => {
    if (productRule) {
      productRulesEdit({
        variables: {
          id: productRule._id,
          name: data.name,
          unitPrice: data.unitPrice,
          bundleId: data.bundleId || null,
          categoryIds:
            data.categoryIds && data.categoryIds.length > 0
              ? data.categoryIds
              : null,
          excludeCategoryIds:
            data.excludeCategoryIds && data.excludeCategoryIds.length > 0
              ? data.excludeCategoryIds
              : null,
          productIds:
            data.productIds && data.productIds.length > 0
              ? data.productIds
              : null,
          excludeProductIds:
            data.excludeProductIds && data.excludeProductIds.length > 0
              ? data.excludeProductIds
              : null,
          tagIds: data.tagIds && data.tagIds.length > 0 ? data.tagIds : null,
          excludeTagIds:
            data.excludeTagIds && data.excludeTagIds.length > 0
              ? data.excludeTagIds
              : null,
        },
        onCompleted: () => {
          toast({
            title: 'Success',
            description: 'Product rule updated successfully',
          });
          onOpenChange?.(false);
        },
        onError: (e) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        },
      });
    } else {
      productRulesAdd({
        variables: {
          name: data.name,
          unitPrice: data.unitPrice,
          bundleId: data.bundleId || null,
          categoryIds:
            data.categoryIds && data.categoryIds.length > 0
              ? data.categoryIds
              : null,
          excludeCategoryIds:
            data.excludeCategoryIds && data.excludeCategoryIds.length > 0
              ? data.excludeCategoryIds
              : null,
          productIds:
            data.productIds && data.productIds.length > 0
              ? data.productIds
              : null,
          excludeProductIds:
            data.excludeProductIds && data.excludeProductIds.length > 0
              ? data.excludeProductIds
              : null,
          tagIds: data.tagIds && data.tagIds.length > 0 ? data.tagIds : null,
          excludeTagIds:
            data.excludeTagIds && data.excludeTagIds.length > 0
              ? data.excludeTagIds
              : null,
        },
        onCompleted: () => {
          toast({
            title: 'Success',
            description: 'Product rule created successfully',
          });
          form.reset();
          onOpenChange?.(false);
        },
        onError: (e) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        },
      });
    }
  };

  const isLoading = loadingAdd || loadingEdit;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex overflow-hidden flex-col h-full"
      >
        <Sheet.Header className="flex-row gap-3 items-center p-5 space-y-0 border-b">
          <Sheet.Title>
            {productRule ? t('edit-product-rule') : t('add-product-rule')}
          </Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            {productRule ? t('edit-product-rule') : t('add-product-rule')}
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content className="overflow-hidden flex-auto">
          <div className="flex flex-col gap-4 p-5 w-full">
            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('name')} <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <Input placeholder={t('name')} {...field} autoFocus />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('unit-price')}{' '}
                      <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
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

            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="categoryIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('choose-categories-to-include')}</Form.Label>
                    <Form.Control>
                      <SelectCategory
                        selected={field.value?.[0] || ''}
                        onSelect={(value) => {
                          field.onChange(value ? [value] : []);
                        }}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="excludeCategoryIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('choose-categories-to-exclude')}</Form.Label>
                    <Form.Control>
                      <SelectCategory
                        selected={field.value?.[0] || ''}
                        onSelect={(value) => {
                          field.onChange(value ? [value] : []);
                        }}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="productIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('choose-products')}</Form.Label>
                    <Form.Control>
                      <SelectProduct
                        mode="multiple"
                        value={field.value || []}
                        onValueChange={(value) => {
                          field.onChange(value || []);
                        }}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="excludeProductIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('choose-exclude-products')}</Form.Label>
                    <Form.Control>
                      <SelectProduct
                        mode="multiple"
                        value={field.value || []}
                        onValueChange={(value) => {
                          field.onChange(value || []);
                        }}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="tagIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('choose-tags')}</Form.Label>
                    <Form.Control>
                      <SelectTags
                        mode="multiple"
                        value={field.value || []}
                        onValueChange={(value) => {
                          field.onChange(value || []);
                        }}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="excludeTagIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('choose-exclude-tags')}</Form.Label>
                    <Form.Control>
                      <SelectTags
                        mode="multiple"
                        value={field.value || []}
                        onValueChange={(value) => {
                          field.onChange(value || []);
                        }}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          </div>
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? productRule
                ? t('updating')
                : t('creating')
              : productRule
              ? t('update')
              : t('create')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
