import { Form, Label } from 'erxes-ui';
import { type Control } from 'react-hook-form';
import { SelectCategory } from '@/pos/hooks/SelectCategory';
import { type ProductsFormData } from '@/pos/components/products/Products';

interface InitialProductCategoriesProps {
  control: Control<ProductsFormData>;
}

export const InitialProductCategories: React.FC<
  InitialProductCategoriesProps
> = ({ control }) => {
  return (
    <Form.Field
      control={control}
      name="initialCategoryIds"
      render={({ field }) => (
        <Form.Item>
          <Label>
            Product Categories <span className="text-destructive">*</span>
          </Label>

          <Form.Control>
            <SelectCategory
              mode="multiple"
              value={field.value}
              onValueChange={field.onChange}
              placeholder="Select initial product categories"
            />
          </Form.Control>
        </Form.Item>
      )}
    />
  );
};
