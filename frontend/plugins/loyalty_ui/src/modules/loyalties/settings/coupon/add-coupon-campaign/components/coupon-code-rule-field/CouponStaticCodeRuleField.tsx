import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { CouponFormValues } from '../../../constants/couponFormSchema';

interface CouponStaticCodeRuleFieldProps {
  form: UseFormReturn<CouponFormValues>;
}

export const CouponStaticCodeRuleField: React.FC<
  CouponStaticCodeRuleFieldProps
> = ({ form }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <Form.Field
          control={form.control}
          name="staticCode"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>CODE</Form.Label>
              <Form.Control>
                <Input
                  placeholder="Enter the coupon code here"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
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
          name="usageLimit"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>USAGE LIMIT</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  placeholder="Enter usage limit"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
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
          name="redemptionLimitPerUser"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>REDEMPTION LIMIT PER USER</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  placeholder="Enter redemption limit per user"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
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
