import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form } from 'erxes-ui';
import { VoucherFormValues } from '../../../constants/voucherFormSchema';
import { SelectProduct, SelectTags } from 'ui-modules';

interface VoucherAddRestrictionMoreFieldsProps {
  form: UseFormReturn<VoucherFormValues>;
}

export const VoucherAddRestrictionMoreFields: React.FC<
  VoucherAddRestrictionMoreFieldsProps
> = ({ form }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <Form.Field
          control={form.control}
          name="productIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Product</Form.Label>
              <Form.Control>
                <SelectProduct
                  mode="multiple"
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(Array.isArray(value) ? value : [value])
                  }
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="tag"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Tag</Form.Label>
              <Form.Control>
                <SelectTags
                  mode="multiple"
                  value={field.value || []}
                  onValueChange={(value) => field.onChange(value)}
                  tagType="tag"
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>

      <div className="flex flex-col gap-4">
        <Form.Field
          control={form.control}
          name="excludeProductIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Or Exclude Product</Form.Label>
              <Form.Control>
                <SelectProduct
                  mode="multiple"
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(Array.isArray(value) ? value : [value])
                  }
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="orExcludeTag"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Or Exclude Tag</Form.Label>
              <Form.Control>
                <SelectTags
                  mode="multiple"
                  value={field.value || []}
                  onValueChange={(value) => field.onChange(value)}
                  tagType="tags"
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </div>
  );
};
