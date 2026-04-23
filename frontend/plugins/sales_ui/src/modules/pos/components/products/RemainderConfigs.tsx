import { Checkbox, Form, Label } from 'erxes-ui';
import { type Control } from 'react-hook-form';
import { SelectCategory } from '@/pos/hooks/SelectCategory';
import { type ProductsFormData } from '@/pos/components/products/Products';

interface RemainderConfigsProps {
  control: Control<ProductsFormData>;
}

export const RemainderConfigs: React.FC<RemainderConfigsProps> = ({
  control,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Form.Field
          control={control}
          name="isCheckRemainder"
          render={({ field }) => (
            <Form.Item>
              <div className="flex gap-2 items-center">
                <Form.Control>
                  <Checkbox
                    id="isCheckRemainder"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
                <Label htmlFor="isCheckRemainder" className="cursor-pointer">
                  Check Remainder
                </Label>
              </div>
            </Form.Item>
          )}
        />

        <Form.Field
          control={control}
          name="banFractions"
          render={({ field }) => (
            <Form.Item>
              <div className="flex gap-2 items-center">
                <Form.Control>
                  <Checkbox
                    id="banFractions"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
                <Label htmlFor="banFractions">BAN FRACTIONS</Label>
              </div>
            </Form.Item>
          )}
        />
      </div>

      <Form.Field
        control={control}
        name="checkExcludeCategoryIds"
        render={({ field }) => (
          <Form.Item>
            <Label>EXCLUDE CATEGORIES</Label>

            <Form.Control>
              <SelectCategory
                mode="multiple"
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Select categories to exclude"
              />
            </Form.Control>
          </Form.Item>
        )}
      />
    </div>
  );
};
