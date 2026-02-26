import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input, Select } from 'erxes-ui';
import { CouponFormValues } from '../../../constants/couponFormSchema';
import { CHARACTER_SET_OPTIONS } from '../../constants/characterSets';

interface CouponDefaultCodeRuleFieldProps {
  form: UseFormReturn<CouponFormValues>;
}

export const CouponDefaultCodeRuleField: React.FC<
  CouponDefaultCodeRuleFieldProps
> = ({ form }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <Form.Field
          control={form.control}
          name="codeLength"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Code Length</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  placeholder="Enter code length"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="prefixUppercase"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Prefix Uppercase</Form.Label>
              <Form.Control>
                <Input
                  type="text"
                  placeholder="Enter prefix uppercase"
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
          name="numberOfCodes"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Number of Codes</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  placeholder="Enter number of codes"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="postfixUppercase"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Postfix Uppercase</Form.Label>
              <Form.Control>
                <Input
                  type="text"
                  placeholder="Enter postfix uppercase"
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
          name="characterSet"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Character Set</Form.Label>
              <Form.Control>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger className="w-full">
                    <Select.Value placeholder="Select character set" />
                  </Select.Trigger>

                  <Select.Content>
                    {CHARACTER_SET_OPTIONS.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="usageLimit"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Usage Limit</Form.Label>
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
          name="pattern"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Pattern</Form.Label>
              <Form.Control>
                <Input
                  type="text"
                  placeholder="Enter pattern"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="redemptionLimitPerUser"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Redemption Limit Per User</Form.Label>
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
