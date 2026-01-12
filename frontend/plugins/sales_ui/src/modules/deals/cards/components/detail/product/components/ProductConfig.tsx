import { Accordion, Form } from 'erxes-ui';
import {
  OtherPayments,
  Payments,
  SelectCategory,
  SelectProduct,
  Token,
} from 'ui-modules';

import { UseFormReturn } from 'react-hook-form';

interface ProductConfigFormValues {
  numberSize?: string;
  isCheckDate?: boolean;
  isCheckUser?: boolean;
  isCheckDepartment?: boolean;
  initialCategoryIds?: string[];
  excludeCategoryIds?: string[];
  excludeProductIds?: string[];
  erxesAppToken?: string;
}

interface ProductConfigProps {
  form: UseFormReturn<ProductConfigFormValues>;
}

const ProductConfig = ({ form }: ProductConfigProps) => {
  const { control } = form;

  return (
    <div className="flex flex-col gap-6">
      <Accordion
        type="multiple"
        defaultValue={['categories', 'exclusions']}
        className="w-full"
      >
        <Accordion.Item value="categories">
          <Accordion.Trigger className="text-sm font-semibold uppercase tracking-wide">
            Initial Product Categories
          </Accordion.Trigger>
          <Accordion.Content className="pt-4">
            <Form.Field
              control={control}
              name="initialCategoryIds"
              render={({ field }) => {
                return (
                  <SelectCategory
                    selected={field.value?.[0] || ''}
                    onSelect={(id) => {
                      const current = field.value || [];
                      const updated = current.includes(id as string)
                        ? current.filter((i: string) => i !== id)
                        : [...current, id];
                      field.onChange(updated);
                    }}
                  />
                );
              }}
            />
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="exclusions">
          <Accordion.Trigger className="text-sm font-semibold uppercase tracking-wide">
            Pipeline Exclude Products
          </Accordion.Trigger>
          <Accordion.Content className="pt-4 space-y-4">
            <Form.Field
              control={control}
              name="excludeCategoryIds"
              render={({ field }) => (
                <SelectCategory
                  selected={field.value?.[0] || ''}
                  onSelect={(id) => {
                    const current = field.value || [];
                    const updated = current.includes(id as string)
                      ? current.filter((i: string) => i !== id)
                      : [...current, id];
                    field.onChange(updated);
                  }}
                />
              )}
            />

            <Form.Field
              control={control}
              name="excludeProductIds"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Exclude Products</Form.Label>
                  <SelectProduct
                    mode="multiple"
                    value={field.value || ([] as string[])}
                    onValueChange={field.onChange}
                    placeholder="Select products to exclude"
                  />
                </Form.Item>
              )}
            />
            <div className="space-y-4">
              <Payments control={form.control} />
              <Token control={form.control} />
              <OtherPayments control={form.control} />
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default ProductConfig;
