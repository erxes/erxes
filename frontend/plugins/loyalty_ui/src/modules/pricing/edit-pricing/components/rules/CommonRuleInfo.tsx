import { useEffect, type ReactNode } from 'react';
import { Button, Form, InfoCard, Input, Select, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectProduct } from 'ui-modules';
import {
  DISCOUNT_TYPES,
  DiscountType,
  PRICE_ADJUST_TYPES,
  PriceAdjustType,
} from '@/pricing/edit-pricing/components';
import { useEditPricing } from '@/pricing/hooks/useEditPricing';
import { IPricingPlanDetail } from '@/pricing/types';

interface CommonRuleInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  embedded?: boolean;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

interface CommonRuleFormValues {
  discountType: DiscountType;
  discountValue: number;
  priceAdjustType: PriceAdjustType;
  priceAdjustFactor: number;
  bonusProductId: string | null;
}

export const CommonRuleInfo = ({
  pricingId,
  pricingDetail,
  embedded = false,
  onSaveActionChange,
}: CommonRuleInfoProps) => {
  const { t } = useTranslation('loyalty');
  const { editPricing, loading } = useEditPricing();
  const { toast } = useToast();

  const form = useForm<CommonRuleFormValues>({
    defaultValues: {
      discountType: 'fixed',
      discountValue: 0,
      priceAdjustType: 'none',
      priceAdjustFactor: 0,
      bonusProductId: null,
    },
  });

  const discountType = form.watch('discountType');
  const { isDirty } = form.formState;

  useEffect(() => {
    if (!pricingDetail) {
      return;
    }

    form.reset({
      discountType: (pricingDetail.type as DiscountType) || 'fixed',
      discountValue: pricingDetail.value ?? 0,
      priceAdjustType:
        (pricingDetail.priceAdjustType as PriceAdjustType) || 'none',
      priceAdjustFactor: pricingDetail.priceAdjustFactor ?? 0,
      bonusProductId: pricingDetail.bonusProduct || null,
    });
  }, [form, pricingDetail]);

  const handleSubmit = async (values: CommonRuleFormValues) => {
    if (!pricingId) {
      return;
    }

    const doc: Parameters<typeof editPricing>[0] = {
      _id: pricingId,
      type: values.discountType,
      value: values.discountValue,
      priceAdjustType: values.priceAdjustType,
      priceAdjustFactor: values.priceAdjustFactor,
      bonusProduct:
        values.discountType === 'bonus'
          ? values.bonusProductId || undefined
          : undefined,
    };

    try {
      await editPricing(doc);
      form.reset(values);
      toast({
        title: t('common-rule-updated'),
        description: t('changes-saved'),
      });
    } catch {
      toast({
        title: t('failed-to-update-common-rule'),
        description: t('unexpected-error'),
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      isDirty ? (
        <Button
          type="submit"
          form="pricing-common-rule-form"
          size="sm"
          disabled={loading}
        >
          {loading ? t('saving') : t('save-changes')}
        </Button>
      ) : null,
    );

    return () => onSaveActionChange(null);
  }, [isDirty, loading, onSaveActionChange]);

  const content = (
    <Form {...form}>
      <form
        id="pricing-common-rule-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
        noValidate
      >
        <Form.Field
          control={form.control}
          name="discountType"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('discount-type')}</Form.Label>
              <Form.Control>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value placeholder={t('select-discount-type')} />
                  </Select.Trigger>
                  <Select.Content>
                    {DISCOUNT_TYPES.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {t(option.label)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Control>
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="discountValue"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('discount-value')} <span className="text-destructive">*</span>
              </Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value) || 0)
                  }
                />
              </Form.Control>
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="priceAdjustType"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('price-adjust-type')}</Form.Label>
              <Form.Control>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value placeholder={t('none')} />
                  </Select.Trigger>
                  <Select.Content>
                    {PRICE_ADJUST_TYPES.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {t(option.label)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Control>
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="priceAdjustFactor"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('price-adjust-factor')}</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value) || 0)
                  }
                />
              </Form.Control>
            </Form.Item>
          )}
        />

        {discountType === 'bonus' && (
          <Form.Field
            control={form.control}
            name="bonusProductId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('bonus-product')}</Form.Label>
                <Form.Control>
                  <SelectProduct
                    value={field.value || ''}
                    onValueChange={(value) =>
                      field.onChange(Array.isArray(value) ? value[0] : value)
                    }
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        )}
      </form>
    </Form>
  );

  if (embedded) {
    return content;
  }

  return (
    <InfoCard title={t('common')}>
      <InfoCard.Content>{content}</InfoCard.Content>
    </InfoCard>
  );
};
