import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CouponFormValues } from '../../../constants/couponFormSchema';

interface CouponStaticCodeRuleFieldProps {
  form: UseFormReturn<CouponFormValues>;
}

export const CouponStaticCodeRuleField: React.FC<
  CouponStaticCodeRuleFieldProps
> = ({ form }) => {
  const { t } = useTranslation('loyalty');
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <Form.Field
          control={form.control}
          name="staticCode"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('code', 'Code')}</Form.Label>
              <Form.Control>
                <Input
                  placeholder={t('enter-coupon-code', 'Enter the coupon code here')}
                  value={field.value ?? ''}
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
              <Form.Label>{t('usage-limit', 'Usage Limit')}</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  placeholder={t('enter-usage-limit', 'Enter usage limit')}
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === ''
                        ? undefined
                        : Number(e.target.value),
                    )
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
          name="redemptionLimitPerUser"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('redemption-limit-per-user', 'Redemption Limit Per User')}</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  placeholder={t('enter-redemption-limit-per-user', 'Enter redemption limit per user')}
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === ''
                        ? undefined
                        : Number(e.target.value),
                    )
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
