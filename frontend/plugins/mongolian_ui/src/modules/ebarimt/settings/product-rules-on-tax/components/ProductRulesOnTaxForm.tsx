import { UseFormReturn } from 'react-hook-form';
import { Button, Dialog, Form, Input, Select, Spinner } from 'erxes-ui';
import { IconX } from '@tabler/icons-react';
import {
  TaxCode,
  TaxType,
} from '@/ebarimt/settings/product-rules-on-tax/constants/productRulesOnTaxDefaultValues';
import { SelectProductCategories } from '@/ebarimt/settings/product-rules-on-tax/components/selects/SelectProductCategories';
import { SelectProducts } from '@/ebarimt/settings/product-rules-on-tax/components/selects/SelectProducts';
import { SelectExcludeProducts } from '@/ebarimt/settings/product-rules-on-tax/components/selects/SelectExcludeProducts';
import { SelectTags } from '@/ebarimt/settings/product-rules-on-tax/components/selects/SelectTags';
import { SelectExcludeTags } from '@/ebarimt/settings/product-rules-on-tax/components/selects/SelectExcludeTags';
import { TProductRulesOnTaxForm } from '@/ebarimt/settings/product-rules-on-tax/constants/productRulesOnTaxSchema.ts';
import { useCallback } from 'react';

export const ProductRulesOnTaxForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<TProductRulesOnTaxForm>;
  onSubmit: (data: TProductRulesOnTaxForm) => void;
  loading: boolean;
}) => {
  const handleNumberChange = useCallback(
    (value: string, onChange: (value: number) => void) => {
      let cleanedValue = '';
      for (let i = 0; i < value.length; i++) {
        const char = value[i];
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="gap-5 grid grid-cols-2 py-3"
      >
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
          name="productCategories"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Product Categories</Form.Label>
              <SelectProductCategories
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
                disabled={loading}
              />
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
                    <Select.Value placeholder="Select a tax type">
                      {field.value ? (
                        <span className="text-foreground">{field.value}</span>
                      ) : (
                        <span className="text-muted-foreground">
                          Select a tax type
                        </span>
                      )}
                    </Select.Value>
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {Object.values(TaxType).map((kind) => (
                    <Select.Item key={kind} value={kind} className="capitalize">
                      {kind}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="excludeCategories"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Exclude Categories</Form.Label>
              <SelectProductCategories
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
                disabled={loading}
              />
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
                    <Select.Value placeholder="Select a tax code">
                      {field.value ? (
                        <span className="text-foreground">{field.value}</span>
                      ) : (
                        <span className="text-muted-foreground">
                          Select a tax code
                        </span>
                      )}
                    </Select.Value>
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {Object.values(TaxCode).map((kind) => (
                    <Select.Item key={kind} value={kind} className="capitalize">
                      {kind}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="products"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Products</Form.Label>
              <SelectProducts
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
                disabled={loading}
              />
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
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="excludeProducts"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Exclude Products</Form.Label>
              <SelectExcludeProducts
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
                disabled={loading}
              />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="percent"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Percent</Form.Label>
              <Form.Control>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={field.value || ''}
                  onChange={(e) => {
                    handleNumberChange(e.target.value, field.onChange);
                  }}
                  placeholder="Enter percent"
                  disabled={loading}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="tags"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Tags</Form.Label>
              <SelectTags
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
                disabled={loading}
              />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="excludeTags"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Exclude Tags</Form.Label>
              <SelectExcludeTags
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
                disabled={loading}
              />
            </Form.Item>
          )}
        />
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
    <Dialog.Content className="max-w-2xl">
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
            <IconX />
          </Button>
        </Dialog.Close>
      </Dialog.Header>
      {children}
    </Dialog.Content>
  );
};
