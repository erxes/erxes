import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CouponFormValues } from '../../../constants/couponFormSchema';
import { COUPON_KIND_TYPES } from '../../constants/couponKindTypeData';

interface CouponAddCampaignCoreFieldsProps {
  form: UseFormReturn<CouponFormValues>;
}

export const CouponAddCampaignCoreFields: React.FC<
  CouponAddCampaignCoreFieldsProps
> = ({ form }) => {
  const { t } = useTranslation('loyalty');
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <Form.Field
          control={form.control}
          name="title"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('title')}</Form.Label>
              <Form.Control>
                <Input placeholder={t('enter-coupon-title')} {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="count"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('count')}</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val === '' ? undefined : Number(val));
                  }}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Form.Field
          control={form.control}
          name="buyScore"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('buy-score')}</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  placeholder={t('enter-coupon-buy-score')}
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

        <Form.Field
          control={form.control}
          name="kind"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('kind')}</Form.Label>
              <Form.Control>
                <Select onValueChange={field.onChange} value={field.value}>
                  <Select.Trigger
                    className={field.value ? '' : 'text-muted-foreground'}
                  >
                    {COUPON_KIND_TYPES.find(
                      (type) => type.value === field.value,
                    )?.label || t('select-kind')}
                  </Select.Trigger>
                  <Select.Content>
                    {COUPON_KIND_TYPES.map((option) => (
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
      </div>
    </div>
  );
};
