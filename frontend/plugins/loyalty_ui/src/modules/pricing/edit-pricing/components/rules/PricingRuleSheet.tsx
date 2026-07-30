import { IconPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input, Select, Sheet } from 'erxes-ui';
import { SelectProduct } from 'ui-modules';
import {
  PRICE_ADJUST_TYPES,
  RULE_DISCOUNT_TYPES,
} from '@/pricing/edit-pricing/components';
import {
  isOptionalInteger,
  isRuleNumber,
  type PricingRuleConfig,
} from '@/pricing/edit-pricing/components/rules/pricingRuleUtils';

interface RuleTypeOption {
  value: string;
  label: string;
}

export interface PricingRuleSheetCallbacks {
  onRuleAdded?: (config: PricingRuleConfig) => boolean | Promise<boolean>;
  onRuleUpdated?: (config: PricingRuleConfig) => boolean | Promise<boolean>;
  editingRule?: PricingRuleConfig | null;
  onEditComplete?: () => void;
}

interface PricingRuleSheetProps extends PricingRuleSheetCallbacks {
  addTitle: string;
  editTitle: string;
  defaultRuleType: string;
  ruleTypeOptions: RuleTypeOption[];
  ruleValueHint: string;
  translateRuleValueHint?: boolean;
}

export const PricingRuleSheet = ({
  addTitle,
  editTitle,
  defaultRuleType,
  ruleTypeOptions,
  ruleValueHint,
  translateRuleValueHint = false,
  onRuleAdded,
  onRuleUpdated,
  editingRule,
  onEditComplete,
}: PricingRuleSheetProps) => {
  const { t } = useTranslation('loyalty');
  const [open, setOpen] = useState(false);
  const form = useForm<PricingRuleConfig>({
    defaultValues: {
      ruleType: defaultRuleType,
      ruleValue: '',
      discountType: 'default',
      discountValue: '',
      priceAdjustType: 'none',
      priceAdjustFactor: '',
      bonusProductId: null,
    },
  });
  const isEditing = Boolean(editingRule);
  const discountType = form.watch('discountType');

  useEffect(() => {
    if (editingRule) {
      setOpen(true);
      form.reset(editingRule);
    }
  }, [editingRule, form]);

  useEffect(() => {
    form.clearErrors(['discountValue', 'bonusProductId']);
  }, [discountType, form]);

  const handleClose = () => {
    form.reset();
    setOpen(false);

    if (editingRule) {
      onEditComplete?.();
    }
  };

  const handleSubmit = async (values: PricingRuleConfig) => {
    const payload: PricingRuleConfig = {
      _id: editingRule?._id,
      ...values,
    };
    const saved = editingRule
      ? await onRuleUpdated?.(payload)
      : await onRuleAdded?.(payload);

    if (saved !== false) {
      handleClose();
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          if (editingRule) {
            form.reset(editingRule);
          }

          setOpen(true);
          return;
        }

        handleClose();
      }}
    >
      <Sheet.Trigger asChild>
        <Button type="button" variant="outline" disabled={isEditing}>
          <IconPlus size={16} className="mr-2" />
          {t('add-rule')}
        </Button>
      </Sheet.Trigger>

      <Sheet.View className="p-0 sm:max-w-lg">
        <Sheet.Header>
          <Sheet.Title>{t(isEditing ? editTitle : addTitle)}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
              noValidate
            >
              <Form.Field
                control={form.control}
                name="ruleType"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('rule-type')}</Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value placeholder={t('choose-rule-type')} />
                        </Select.Trigger>
                        <Select.Content>
                          {ruleTypeOptions.map((option) => (
                            <Select.Item
                              key={option.value}
                              value={option.value}
                            >
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
                name="ruleValue"
                rules={{
                  validate: (value) =>
                    isRuleNumber(value) || t('number-required'),
                }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('rule-value')}</Form.Label>
                    <Form.Control>
                      <Input
                        placeholder={
                          translateRuleValueHint
                            ? t(ruleValueHint)
                            : ruleValueHint
                        }
                        type="number"
                        {...field}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('discount-type')}</Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value
                            placeholder={t('choose-discount-type')}
                          />
                        </Select.Trigger>
                        <Select.Content>
                          {RULE_DISCOUNT_TYPES.map((option) => (
                            <Select.Item
                              key={option.value}
                              value={option.value}
                            >
                              {t(option.label)}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                  </Form.Item>
                )}
              />

              {discountType !== 'default' && discountType !== 'bonus' && (
                <Form.Field
                  control={form.control}
                  name="discountValue"
                  rules={{
                    validate: (value) =>
                      isRuleNumber(value) || t('number-required'),
                  }}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('discount-value')}</Form.Label>
                      <Form.Control>
                        <Input
                          type="number"
                          placeholder={
                            discountType === 'percentage' ? '0%' : '0.00'
                          }
                          {...field}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}

              {discountType === 'bonus' && (
                <Form.Field
                  control={form.control}
                  name="bonusProductId"
                  rules={{ required: t('select-at-least-one-product') }}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('bonus-product')}</Form.Label>
                      <Form.Control>
                        <SelectProduct
                          mode="single"
                          value={field.value || ''}
                          onValueChange={(value) =>
                            field.onChange(value || null)
                          }
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}

              <Form.Field
                control={form.control}
                name="priceAdjustType"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('price-adjust-type')}</Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value placeholder={t('choose-type')} />
                        </Select.Trigger>
                        <Select.Content>
                          {PRICE_ADJUST_TYPES.map((option) => (
                            <Select.Item
                              key={option.value}
                              value={option.value}
                            >
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
                rules={{
                  validate: (value) =>
                    isOptionalInteger(value) || t('number-required'),
                }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('price-adjust-factor')}</Form.Label>
                    <Form.Control>
                      <Input placeholder="0" type="number" {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={form.formState.isSubmitting}
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {t('save')}
                </Button>
              </div>
            </form>
          </Form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
