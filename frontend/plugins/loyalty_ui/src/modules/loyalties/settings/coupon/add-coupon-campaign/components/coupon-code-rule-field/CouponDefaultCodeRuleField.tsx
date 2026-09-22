import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CouponFormValues } from '../../../constants/couponFormSchema';
import { CHARACTER_SET_OPTIONS } from '../../constants/characterSets';

interface CouponDefaultCodeRuleFieldProps {
  form: UseFormReturn<CouponFormValues>;
}

export const CouponDefaultCodeRuleField: React.FC<
  CouponDefaultCodeRuleFieldProps
> = ({ form }) => {
  const { t } = useTranslation('loyalty');
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <Form.Field
          control={form.control}
          name="codeLength"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('code-length')}</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  placeholder={t('enter-code-length')}
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
              <Form.Label>{t('prefix-uppercase')}</Form.Label>
              <Form.Control>
                <Input
                  type="text"
                  placeholder={t('enter-prefix-uppercase')}
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
              <Form.Label>{t('number-of-codes')}</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  placeholder={t('enter-number-of-codes')}
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
              <Form.Label>{t('postfix-uppercase')}</Form.Label>
              <Form.Control>
                <Input
                  type="text"
                  placeholder={t('enter-postfix-uppercase')}
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
              <Form.Label>{t('character-set')}</Form.Label>
              <Form.Control>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger className="w-full">
                    <Select.Value placeholder={t('select-character-set')} />
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
              <Form.Label>{t('usage-limit')}</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  placeholder={t('enter-usage-limit')}
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
              <Form.Label>{t('pattern')}</Form.Label>
              <Form.Control>
                <Input
                  type="text"
                  placeholder={t('enter-pattern')}
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
              <Form.Label>{t('redemption-limit-per-user')}</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  placeholder={t('enter-redemption-limit-per-user')}
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
