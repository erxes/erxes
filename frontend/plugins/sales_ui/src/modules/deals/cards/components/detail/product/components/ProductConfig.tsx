import { Form, Separator } from 'erxes-ui';
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
    <div className="flex flex-col gap-8">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground">
            Initial Product Categories
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Select the initial product categories for this configuration
          </p>
        </div>
        <Form.Field
          control={control}
          name="initialCategoryIds"
          render={({ field }) => {
            return (
              <SelectCategory
                selected={field.value?.[0] || ''}
                onSelect={(id) => {
                  field.onChange([id]);
                }}
              />
            );
          }}
        />
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground">
            Pipeline Exclude Products
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure products and categories to exclude from the pipeline
          </p>
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
                    field.onChange([id]);
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

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground">
            Payment Configuration
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure payment methods and settings for this configuration
          </p>
        </div>
        <div className="space-y-6">
          <Payments control={form.control} />
          <Separator />
          <Token control={form.control} />
          <Separator />
          <OtherPayments control={form.control} />
        </div>
      </div>
    </div>
  );
};

export default ProductConfig;
