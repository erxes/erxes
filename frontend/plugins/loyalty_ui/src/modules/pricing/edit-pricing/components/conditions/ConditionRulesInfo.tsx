import { type ReactNode, useEffect } from 'react';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ConditionRuleSheet } from '@/pricing/edit-pricing/components/conditions/ConditionRuleSheet';
import { usePricingConditionRules } from '@/pricing/hooks/usePricingConditionRules';
import { usePricingProductConditions } from '@/pricing/hooks/usePricingProductConditions';
import { IPricingConditionRule, IPricingPlanDetail } from '@/pricing/types';

interface ConditionRulesInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

const discountValueLabel = ({
  discountType,
  discountValue,
}: IPricingConditionRule) => {
  if (discountType === 'percentage') {
    return `${discountValue}%`;
  }

  return discountType === 'subtraction' ? String(discountValue) : '—';
};

export const ConditionRulesInfo = ({
  pricingId,
  pricingDetail,
  onSaveActionChange,
}: ConditionRulesInfoProps) => {
  const { t } = useTranslation('loyalty');
  const { conditions, loading: conditionsLoading } =
    usePricingProductConditions();
  const {
    rules,
    editor,
    takenCodes,
    openNew,
    openEdit,
    closeEditor,
    submitRule,
    removeRule,
    save,
    saving,
    isDirty,
  } = usePricingConditionRules({ pricingId, pricingDetail });
  const nameByCode = new Map(conditions.map(({ code, name }) => [code, name]));

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      isDirty ? (
        <Button type="button" size="sm" onClick={save} disabled={saving}>
          {saving ? t('saving') : t('save-changes')}
        </Button>
      ) : null,
    );

    return () => onSaveActionChange(null);
  }, [isDirty, onSaveActionChange, save, saving, t]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t(
            'condition-discounts-hint',
            'A product sold under one of these conditions is priced by its rule instead of the plan discount and the plan’s quantity, price and expiry rules. The plan still has to apply to the sale.',
          )}
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0"
          onClick={openNew}
        >
          <IconPlus />
          {t('add-condition-discount', 'Add condition discount')}
        </Button>
      </div>

      {rules.length === 0 ? (
        <div className="py-6 text-sm text-center text-muted-foreground">
          {t('no-condition-discounts', 'No condition discounts')}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex px-3 text-sm font-medium text-muted-foreground">
            <div className="flex-[2]">{t('condition', 'Condition')}</div>
            <div className="flex-1">{t('discount-type')}</div>
            <div className="flex-1">{t('discount-value')}</div>
            <div className="flex-1">{t('price-adjust-type')}</div>
            <div className="flex-1">{t('price-adjust-factor')}</div>
            <div className="w-20 text-center">{t('actions')}</div>
          </div>

          {rules.map((rule) => (
            <div
              key={rule.conditionCode}
              className="flex items-center px-3 py-2 text-sm border rounded-lg"
            >
              <div className="flex-[2] truncate">
                {nameByCode.get(rule.conditionCode) ??
                  `${rule.conditionCode} (${t('removed', 'removed')})`}
              </div>
              <div className="flex-1 truncate">{t(rule.discountType)}</div>
              <div className="flex-1 truncate">{discountValueLabel(rule)}</div>
              <div className="flex-1 truncate">{rule.priceAdjustType}</div>
              <div className="flex-1 truncate">{rule.priceAdjustFactor}</div>
              <div className="flex justify-center w-20 gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={t('edit', 'Edit')}
                  onClick={() => openEdit(rule)}
                >
                  <IconEdit size={14} />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="text-destructive"
                  aria-label={t('delete', 'Delete')}
                  onClick={() => removeRule(rule.conditionCode)}
                >
                  <IconTrash size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConditionRuleSheet
        open={editor.open}
        rule={editor.open ? editor.rule : null}
        takenCodes={takenCodes}
        conditions={conditions}
        conditionsLoading={conditionsLoading}
        onSubmit={submitRule}
        onClose={closeEditor}
      />
    </div>
  );
};
