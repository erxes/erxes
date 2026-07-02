import { useEffect, useState } from 'react';
import { Button, Form, Input, Select, Sheet } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectProduct } from 'ui-modules';
import {
  DISCOUNT_TYPES,
  DiscountType,
  PRICE_ADJUST_TYPES,
  PriceAdjustType,
} from '@/pricing/edit-pricing/components';
import { IconPlus } from '@tabler/icons-react';

export interface ExpiryRuleConfig {
  _id?: string;
  ruleType: string;
  ruleValue: string;
  discountType: DiscountType;
  discountValue: string;
  priceAdjustType: PriceAdjustType;
  priceAdjustFactor: string;
  bonusProductId?: string | null;
}

interface ExpiryRuleSheetProps {
  onRuleAdded?: (config: ExpiryRuleConfig) => void;
  onRuleUpdated?: (config: ExpiryRuleConfig) => void;
  editingRule?: ExpiryRuleConfig | null;
  onEditComplete?: () => void;
}

export const ExpiryRuleSheet: React.FC<ExpiryRuleSheetProps> = ({
  onRuleAdded,
  onRuleUpdated,
  editingRule,
  onEditComplete,
}) => {
  const { t } = useTranslation('loyalty');
  const [open, setOpen] = useState(false);

  const form = useForm<ExpiryRuleConfig>({
    defaultValues: {
      ruleType: 'hour',
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

  const handleClose = () => {
    form.reset();
    setOpen(false);
    if (editingRule) {
      onEditComplete?.();
    }
  };

  const handleSubmit = (values: ExpiryRuleConfig) => {
    const payload: ExpiryRuleConfig = {
      _id: editingRule?._id,
      ...values,
    };

    if (editingRule) {
      onRuleUpdated?.(payload);
    } else {
      onRuleAdded?.(payload);
    }

    handleClose();
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
      {!isEditing && (
        <Sheet.Trigger asChild>
          <Button variant="outline">
            {' '}
            <IconPlus size={16} className="mr-2" /> {t('add-rule')}
          </Button>
        </Sheet.Trigger>
      )}

      <Sheet.View className="p-0 sm:max-w-lg">
        <Sheet.Header>
          <Sheet.Title>
            {isEditing ? t('edit-expiry-rule') : t('add-new-expiry-rule')}
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
                          <Select.Item value="hour">{t('hour')}</Select.Item>
                          <Select.Item value="day">{t('day')}</Select.Item>
                          <Select.Item value="week">{t('week')}</Select.Item>
                          <Select.Item value="month">{t('month')}</Select.Item>
                          <Select.Item value="year">{t('year')}</Select.Item>
                        </Select.Content>
                      </Select>
                    </Form.Control>
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="ruleValue"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('rule-value')}</Form.Label>
                    <Form.Control>
                      <Input
                        placeholder={t('enter-number')}
                        type="number"
                        {...field}
                      />
                    </Form.Control>
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
                          <Select.Value placeholder={t('choose-discount-type')} />
                        </Select.Trigger>
                        <Select.Content>
                          {DISCOUNT_TYPES.map((option) => (
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
                    </Form.Item>
                  )}
                />
              )}

              {discountType === 'bonus' && (
                <Form.Field
                  control={form.control}
                  name="bonusProductId"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('discount-value')}</Form.Label>
                      <Form.Control>
                        <SelectProduct
                          mode="single"
                          value={field.value || ''}
                          onValueChange={(value) =>
                            field.onChange(value || null)
                          }
                        />
                      </Form.Control>
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
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('price-adjust-factor')}</Form.Label>
                    <Form.Control>
                      <Input placeholder="0" type="number" {...field} />
                    </Form.Control>
                  </Form.Item>
                )}
              />

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  {t('cancel')}
                </Button>
                <Button type="submit">{t('save')}</Button>
              </div>
            </form>
          </Form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
