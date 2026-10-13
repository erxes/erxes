import { useToast } from 'erxes-ui';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditPricing } from '@/pricing/hooks/useEditPricing';
import { IPricingConditionRule, IPricingPlanDetail } from '@/pricing/types';

// Picks the input fields only; the query result also carries __typename.
const toRule = ({
  conditionCode,
  discountType,
  discountValue,
  discountBonusProduct,
  priceAdjustType,
  priceAdjustFactor,
}: IPricingConditionRule): IPricingConditionRule => ({
  conditionCode,
  discountType,
  discountValue: discountValue ?? 0,
  discountBonusProduct: discountType === 'bonus' ? discountBonusProduct : null,
  priceAdjustType: priceAdjustType || 'none',
  priceAdjustFactor: priceAdjustFactor ?? 0,
});

type ConditionRuleEditor =
  | { open: false }
  | { open: true; rule: IPricingConditionRule | null };

export const usePricingConditionRules = ({
  pricingId,
  pricingDetail,
}: {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
}) => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();
  const { editPricing, loading } = useEditPricing();
  const [rules, setRules] = useState<IPricingConditionRule[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [editor, setEditor] = useState<ConditionRuleEditor>({ open: false });

  useEffect(() => {
    setRules((pricingDetail?.conditionRules || []).map(toRule));
    setIsDirty(false);
  }, [pricingDetail]);

  const openNew = () => setEditor({ open: true, rule: null });
  const openEdit = (rule: IPricingConditionRule) =>
    setEditor({ open: true, rule });
  const closeEditor = () => setEditor({ open: false });

  const editingCode = editor.open ? editor.rule?.conditionCode : undefined;

  // Each condition may carry one rule; the one being edited keeps its own code.
  const takenCodes = rules
    .map(({ conditionCode }) => conditionCode)
    .filter((code) => code !== editingCode);

  const submitRule = (rule: IPricingConditionRule) => {
    const next = toRule(rule);

    setRules((prev) =>
      editingCode
        ? prev.map((existing) =>
            existing.conditionCode === editingCode ? next : existing,
          )
        : [...prev, next],
    );
    setIsDirty(true);
    closeEditor();
  };

  const removeRule = (conditionCode: string) => {
    setRules((prev) =>
      prev.filter((rule) => rule.conditionCode !== conditionCode),
    );
    setIsDirty(true);
  };

  const save = useCallback(async () => {
    if (!pricingId) {
      return;
    }

    try {
      await editPricing({ _id: pricingId, conditionRules: rules });
      setIsDirty(false);
      toast({
        title: t('condition-discounts-updated', 'Condition discounts updated'),
        description: t('changes-saved'),
      });
    } catch (e) {
      toast({
        title: t(
          'failed-to-update-condition-discounts',
          'Failed to update condition discounts',
        ),
        description: e instanceof Error ? e.message : t('unexpected-error'),
        variant: 'destructive',
      });
    }
  }, [editPricing, pricingId, rules, t, toast]);

  return {
    rules,
    editor,
    takenCodes,
    openNew,
    openEdit,
    closeEditor,
    submitRule,
    removeRule,
    save,
    saving: loading,
    isDirty,
  };
};
