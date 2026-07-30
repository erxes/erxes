import { useEffect, useState } from 'react';
import { Button, Form, Input, Select, Sheet } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectProduct } from 'ui-modules';
import {
  RULE_DISCOUNT_TYPES,
  PRICE_ADJUST_TYPES,
} from '@/pricing/edit-pricing/components';
import {
  isOptionalInteger,
  isRuleNumber,
  type PricingRuleConfig,
} from '@/pricing/edit-pricing/components/rules/pricingRuleUtils';
import { IconPlus } from '@tabler/icons-react';

export type PriceRuleConfig = PricingRuleConfig;

interface PriceRuleSheetProps {
  onRuleAdded?: (config: PriceRuleConfig) => boolean | Promise<boolean>;
  onRuleUpdated?: (config: PriceRuleConfig) => boolean | Promise<boolean>;
  editingRule?: PriceRuleConfig | null;
  onEditComplete?: () => void;
}

export const PriceRuleSheet: React.FC<PriceRuleSheetProps> = ({
  onRuleAdded,
  onRuleUpdated,
  editingRule,
  onEditComplete,
}) => {
  const { t } = useTranslation('loyalty');
  const [open, setOpen] = useState(false);

  const form = useForm<PriceRuleConfig>({
    defaultValues: {
      ruleType: 'exact',
      ruleValue: '',
      discountType: 'default',
      discountValue: '',
      priceAdjustType: 'none',
      priceAdjustFactor: '',
      bonusProductId: null,
    },
  });

  const isEditing = !!editingRule;

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

  const handleSubmit = async (values: PriceRuleConfig) => {
    const payload: PriceRuleConfig = {
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
      onOpenChange={(next) => {
        if (next) {
          if (editingRule) {
            form.reset(editingRule);
          }
          setOpen(true);
        } else {
          handleClose();
        }
      }}
    >
      <Sheet.Trigger asChild>
        <Button variant="outline" disabled={isEditing}>
          <IconPlus size={16} className="mr-2" />
          {t('add-rule')}
        </Button>
      </Sheet.Trigger>

      <Sheet.View className="p-0 sm:max-w-lg">
        <Sheet.Header>
          <Sheet.Title>
            {isEditing ? t('edit-price-rule') : t('add-price-rule')}
          </Sheet.Title>
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
                          <Select.Item value="exact">{t('exact')}</Select.Item>
                          <Select.Item value="every">{t('every')}</Select.Item>
                          <Select.Item value="minimum">
                            {t('minimum')}
                          </Select.Item>
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
                      <Input placeholder="0.00$" type="number" {...field} />
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

              <div className="flex gap-2 justify-end pt-4">
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
