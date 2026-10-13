import { Button, Form, InputNumber, Select, Sheet } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectProduct } from 'ui-modules';
import {
  PRICE_ADJUST_TYPES,
  RULE_DISCOUNT_TYPES,
} from '@/pricing/edit-pricing/components';
import { useConditionRuleForm } from '@/pricing/hooks/useConditionRuleForm';
import { IPricingProductCondition } from '@/pricing/hooks/usePricingProductConditions';
import { IPricingConditionRule } from '@/pricing/types';

// The backend has no 'truncate' adjustment; it would be rejected on save.
const CONDITION_PRICE_ADJUST_TYPES = PRICE_ADJUST_TYPES.filter(
  ({ value }) => value !== 'truncate',
);

interface ConditionRuleSheetProps {
  open: boolean;
  rule: IPricingConditionRule | null;
  takenCodes: string[];
  conditions: IPricingProductCondition[];
  conditionsLoading: boolean;
  onSubmit: (rule: IPricingConditionRule) => void;
  onClose: () => void;
}

export const ConditionRuleSheet = ({
  open,
  rule,
  takenCodes,
  conditions,
  conditionsLoading,
  onSubmit,
  onClose,
}: ConditionRuleSheetProps) => {
  const { t } = useTranslation('loyalty');
  const { form, discountType } = useConditionRuleForm({
    open,
    rule,
    takenCodes,
  });
  const knownCodes = new Set(conditions.map(({ code }) => code));

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <Sheet.View className="p-0 sm:max-w-lg">
        <Sheet.Header>
          <Sheet.Title>
            {rule
              ? t('edit-condition-discount', 'Edit condition discount')
              : t('add-condition-discount', 'Add condition discount')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <Form.Field
                control={form.control}
                name="conditionCode"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('condition', 'Condition')}</Form.Label>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={conditionsLoading}
                    >
                      <Form.Control>
                        <Select.Trigger className="w-full">
                          <Select.Value
                            placeholder={t(
                              'choose-condition',
                              'Choose a condition',
                            )}
                          />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        {conditions.map(({ _id, code, name }) => (
                          <Select.Item key={_id} value={code}>
                            {name} ({code})
                          </Select.Item>
                        ))}
                        {/* The condition was removed in core; its code still matches when it comes back. */}
                        {field.value && !knownCodes.has(field.value) && (
                          <Select.Item value={field.value}>
                            {field.value} ({t('removed', 'removed')})
                          </Select.Item>
                        )}
                      </Select.Content>
                    </Select>
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Form.Control>
                        <Select.Trigger className="w-full">
                          <Select.Value
                            placeholder={t('choose-discount-type')}
                          />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        {RULE_DISCOUNT_TYPES.map((option) => (
                          <Select.Item key={option.value} value={option.value}>
                            {t(option.label)}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              {(discountType === 'subtraction' ||
                discountType === 'percentage') && (
                <Form.Field
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('discount-value')}</Form.Label>
                      <Form.Control>
                        <InputNumber
                          value={field.value}
                          min={0}
                          max={discountType === 'percentage' ? 100 : undefined}
                          onChange={(value) => field.onChange(value || 0)}
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
                  name="discountBonusProduct"
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Form.Control>
                        <Select.Trigger className="w-full">
                          <Select.Value placeholder={t('choose-type')} />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        {CONDITION_PRICE_ADJUST_TYPES.map((option) => (
                          <Select.Item key={option.value} value={option.value}>
                            {t(option.label)}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                    <Form.Message />
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
                      <InputNumber
                        value={field.value}
                        min={0}
                        onChange={(value) => field.onChange(value || 0)}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
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
