import {
  OtherPayments,
  Payments,
  SelectCategory,
  SelectProduct,
  Token,
} from 'ui-modules';

import { Form } from 'erxes-ui';
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
    <div className="flex flex-col gap-8">
      <div>
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground">
            Initial Product Categories
          </h3>
        </div>
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
      </div>
      <div>
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground">
            Pipeline Exclude Products
          </h3>
        </div>
        <div className="space-y-6">
          <Form.Field
            control={control}
            name="excludeCategoryIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="text-sm font-medium">
                  Exclude Categories
                </Form.Label>
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
              </Form.Item>
            )}
          />
          <Form.Field
            control={control}
            name="excludeProductIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="text-sm font-medium">
                  Exclude Products
                </Form.Label>
                <SelectProduct
                  mode="multiple"
                  value={field.value || ([] as string[])}
                  onValueChange={field.onChange}
                  placeholder="Select products to exclude"
                />
              </Form.Item>
            )}
          />
        </div>
      </div>
      <div>
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground">
            Other Configuration
          </h3>
        </div>
        <div className="space-y-6">
          <Payments control={form.control} />
          <Token control={form.control} />
          <OtherPayments control={form.control} />
        </div>
      </div>
    </div>
  );
};

export default ProductConfig;
