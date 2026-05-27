import { TAX_TYPES } from '@/ebarimt/settings/product-rules-on-tax/constants/productRulesOnTaxDefaultValues';
import { TProductRulesOnTaxForm } from '@/ebarimt/settings/product-rules-on-tax/constants/productRulesOnTaxSchema.ts';
import { Button, Dialog, Form, Input, Select, Spinner } from 'erxes-ui';
import { useCallback, useEffect } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { SelectCategory, SelectProduct, SelectTags } from 'ui-modules';

export const ProductRulesOnTaxForm = ({
  form,
  onSubmit,
  loading,
  isSheet = false,
  formId,
}: {
  form: UseFormReturn<TProductRulesOnTaxForm>;
  onSubmit: (data: TProductRulesOnTaxForm) => void;
  loading: boolean;
  isSheet?: boolean;
  formId?: string;
}) => {
  const taxType = useWatch({ control: form.control, name: 'taxType' }) || '';

  useEffect(() => {
    if (taxType === 'ctax') {
      form.setValue('kind', 'ctax');
    } else {
      form.setValue('kind', 'vat');
      form.setValue('taxPercent', Number(TAX_TYPES[taxType]?.percent) || 0);
    }
  }, [taxType, form]);

  const handleNumberChange = useCallback(
    (value: string, onChange: (value: number) => void) => {
      let cleanedValue = '';
      for (const char of value) {
        if ((char >= '0' && char <= '9') || char === '.') {
          cleanedValue += char;
        }
      }

      if (cleanedValue === '') {
        onChange(0);
        return;
      }

      if (cleanedValue === '.') {
        return;
      }

      const numericValue = Number.parseFloat(cleanedValue);

      if (!Number.isNaN(numericValue)) {
        onChange(numericValue);
      }
    },
    [],
  );

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="gap-5 grid grid-cols-2 py-3">
          <div>
            <Form.Field
              control={form.control}
              name="title"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Title</Form.Label>
                  <Form.Control>
                    <Input
                      placeholder="Enter title"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="taxType"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Tax Type</Form.Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Form.Control>
                      <Select.Trigger className="text-muted-foreground">
                        <Select.Value placeholder="Select a tax type" />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      {Object.keys(TAX_TYPES).map((key) => (
                        <Select.Item
                          key={key}
                          value={key}
                          className="capitalize"
                        >
                          {TAX_TYPES[key].label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="taxCode"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Tax Code</Form.Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Form.Control>
                      <Select.Trigger className="text-muted-foreground">
                        <Select.Value placeholder="Select a tax code" />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      {TAX_TYPES[taxType]?.options.map((opt) => (
                        <Select.Item
                          key={opt.value}
                          value={opt.value}
                          className="capitalize"
                        >
                          <div className="w-full min-w-0">
                            <span className="truncate">{opt.label}</span>
                          </div>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="kind"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Kind</Form.Label>
                  <Form.Control>
                    <Input
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={true}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="taxPercent"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Percent</Form.Label>
                  <Form.Control>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={field.value || 0}
                      onChange={(e) => {
                        handleNumberChange(e.target.value, field.onChange);
                      }}
                      placeholder="Enter percent"
                      disabled={!!TAX_TYPES[taxType]?.percent}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>

          <div>
            <Form.Field
              control={form.control}
              name="productCategoryIds"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>PRODUCT CATEGORIES</Form.Label>
                  <Form.Control>
                    <SelectCategory
                      value={field.value}
                      onSelect={field.onChange}
                      mode="multiple"
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="excludeCategoryIds"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Exclude Categories</Form.Label>
                  <SelectCategory
                    value={field.value}
                    onSelect={field.onChange}
                    mode="multiple"
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="productIds"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Products</Form.Label>
                  <SelectProduct
                    value={field.value}
                    onValueChange={field.onChange}
                    mode="multiple"
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="excludeProductIds"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Exclude Products</Form.Label>
                  <SelectProduct
                    value={field.value}
                    onValueChange={field.onChange}
                    mode="multiple"
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="tagIds"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Tags</Form.Label>
                  <SelectTags
                    value={field.value}
                    onValueChange={field.onChange}
                    mode="multiple"
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="excludeTagIds"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Exclude Tags</Form.Label>
                  <SelectTags
                    value={field.value}
                    onValueChange={field.onChange}
                    mode="multiple"
                  />
                </Form.Item>
              )}
            />
          </div>
        </div>

        {!isSheet && (
          <Dialog.Footer className="col-span-2 mt-3 gap-2">
            <Dialog.Close asChild>
              <Button variant="outline" size="lg">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit" disabled={loading} size="lg">
              {loading ? <Spinner /> : 'Save'}
            </Button>
          </Dialog.Footer>
        )}
      </form>
    </Form>
  );
};

export const EBarimtDialog = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => {
  return (
    <Dialog.Content className="max-w-4xl">
      <Dialog.Header>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description className="sr-only">
          {description}
        </Dialog.Description>
        <Dialog.Close asChild>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-4 top-3"
          >
            ×
          </Button>
        </Dialog.Close>
      </Dialog.Header>
      {children}
    </Dialog.Content>
  );
};
