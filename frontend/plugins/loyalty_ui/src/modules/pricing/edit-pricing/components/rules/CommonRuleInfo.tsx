import { useEffect, useState, type ReactNode } from 'react';
import { Button, Form, InfoCard, Input, Select, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
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
  const { editPricing, loading } = useEditPricing();
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);

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

  useEffect(() => {
    const subscription = form.watch(() => {
      setHasChanges(true);
    });

    return () => subscription.unsubscribe();
  }, [form]);

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
    setHasChanges(false);
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
      setHasChanges(false);
      toast({
        title: 'Common rule updated',
        description: 'Changes have been saved successfully.',
      });
    } catch {
      toast({
        title: 'Failed to update common rule',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      hasChanges ? (
        <Button
          type="submit"
          form="pricing-common-rule-form"
          size="sm"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      ) : null,
    );

    return () => onSaveActionChange(null);
  }, [hasChanges, loading, onSaveActionChange]);

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
              <Form.Label>Discount type</Form.Label>
              <Form.Control>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value placeholder="Select discount type" />
                  </Select.Trigger>
                  <Select.Content>
                    {DISCOUNT_TYPES.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
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
                Discount value <span className="text-destructive">*</span>
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
              <Form.Label>Price adjust type</Form.Label>
              <Form.Control>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value placeholder="None" />
                  </Select.Trigger>
                  <Select.Content>
                    {PRICE_ADJUST_TYPES.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
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
              <Form.Label>Price adjust factor</Form.Label>
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
                <Form.Label>Bonus product</Form.Label>
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
    <InfoCard title="Common">
      <InfoCard.Content>{content}</InfoCard.Content>
    </InfoCard>
  );
};
