import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { CouponFormValues } from '../../../constants/couponFormSchema';
import { SelectCategory } from '~/modules/pricing/components/SelectCategory';

interface CouponAddRestrictionCoreFieldProps {
  form: UseFormReturn<CouponFormValues>;
}

export const CouponAddRestrictionCoreField: React.FC<
  CouponAddRestrictionCoreFieldProps
> = ({ form }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <Form.Field
          control={form.control}
          name="minimumSpend"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Minimum Spend</Form.Label>
              <Form.Control>
                <Input
                  type="text"
                  placeholder="Enter minimum spend"
                  {...field}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="categoryIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Product Category</Form.Label>
              <Form.Control>
                <SelectCategory
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
      </div>
      <div className="flex flex-col gap-4">
        <Form.Field
          control={form.control}
          name="maximumSpend"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Maximum Spend</Form.Label>
              <Form.Control>
                <Input
                  type="text"
                  placeholder="Enter maximum spend"
                  {...field}
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
              <Form.Label>Or Exclude Product Category</Form.Label>
              <Form.Control>
                <SelectCategory
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
      </div>
    </div>
  );
};
