import { useEffect, type ReactNode } from 'react';
import { Button, Form, InfoCard, Input, Select, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useMutation, useApolloClient } from '@apollo/client';
import { SelectProduct } from 'ui-modules';
import {
  DISCOUNT_TYPES,
  DiscountType,
  PRICE_ADJUST_TYPES,
  PriceAdjustType,
} from '@/pricing/edit-pricing/components';
import { useEditPricing } from '@/pricing/hooks/useEditPricing';
import { IPricingPlanDetail, IPricingFixedValue } from '@/pricing/types';
import {
  PRICING_FIXED_VALUE_ADD,
  PRICING_FIXED_VALUE_EDIT,
} from '@/pricing/graphql/mutations';
import { FixedPricingTable } from './FixedPricingTable';
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
  fixedValues: IPricingFixedValue[];
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
  const client = useApolloClient();
  const [addFixedValue] = useMutation(PRICING_FIXED_VALUE_ADD);
  const [editFixedValue] = useMutation(PRICING_FIXED_VALUE_EDIT);
  const form = useForm<CommonRuleFormValues>({
    defaultValues: {
      discountType: 'fixed',
      discountValue: 0,
      priceAdjustType: 'none',
      priceAdjustFactor: 0,
      bonusProductId: null,
      fixedValues: [],
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
      fixedValues: form.getValues('fixedValues'),
    });
  }, [form, pricingDetail]);

  const handleSubmit = async (values: CommonRuleFormValues) => {
    if (!pricingId) {
      return;
    }
    try {
      await editPricing({
        _id: pricingId,
        type: values.discountType,
        value: values.discountValue,
        priceAdjustType: values.priceAdjustType,
        priceAdjustFactor: values.priceAdjustFactor,
        bonusProduct:
          values.discountType === 'bonus'
            ? values.bonusProductId || undefined
            : undefined,
      });

      if (values.discountType === 'fixed') {
        await Promise.all(
          values.fixedValues
            .filter((fv) => fv.newPrice !== fv.unitPrice)
            .map((fv) => {
              const doc = {
                productId: fv.productId,
                sortField: fv.sortField || '',
                uom: fv.uom,
                unitPrice: fv.unitPrice,
                newPrice: fv.newPrice,
              };
              if (fv._id) {
                return editFixedValue({ variables: { id: fv._id, doc } });
              }
              return addFixedValue({
                variables: { pricingPlanId: pricingId, doc },
              });
            }),
        );
      }

      await client.refetchQueries({
        include: ['PricingPlanDetail', 'PricingFixedValuesPage'],
      });

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

        {discountType !== 'fixed' && (
          <>
            <Form.Field
              control={form.control}
              name="discountValue"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {t('discount-value')}{' '}
                    <span className="text-destructive">*</span>
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
                          field.onChange(
                            Array.isArray(value) ? value[0] : value,
                          )
                        }
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />
            )}
          </>
        )}
        {discountType === 'fixed' && pricingId && (
          <FixedPricingTable
            control={form.control}
            pricingId={pricingId}
            onSave={form.handleSubmit(handleSubmit)}
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
