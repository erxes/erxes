import { useEffect, useState } from 'react';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useEditPricing } from '@/pricing/hooks/useEditPricing';
import { IPricingPlanDetail } from '@/pricing/types';
import {
  getPricingRuleDocument,
  getPricingRuleEnabled,
  getPricingRules,
  mapRuleToConfig,
  type PricingRuleConfig,
  type PricingRuleType,
} from '@/pricing/edit-pricing/components/rules/pricingRuleUtils';

interface UsePricingRulesOptions {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  ruleType: PricingRuleType;
  title: string;
  successTitle: string;
  errorTitle: string;
}

export const usePricingRules = ({
  pricingId,
  pricingDetail,
  ruleType,
  title,
  successTitle,
  errorTitle,
}: UsePricingRulesOptions) => {
  const [rules, setRules] = useState<PricingRuleConfig[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRuleConfig | null>(
    null,
  );

  const { t } = useTranslation('loyalty');
  const { editPricing, loading } = useEditPricing();
  const { toast } = useToast();

  useEffect(() => {
    if (!pricingDetail) {
      return;
    }

    setRules(getPricingRules(pricingDetail, ruleType).map(mapRuleToConfig));
    setEnabled(getPricingRuleEnabled(pricingDetail, ruleType));
  }, [pricingDetail, ruleType]);

  const persistRules = async (
    nextRules: PricingRuleConfig[],
    nextEnabled: boolean,
    toastTitle = successTitle,
  ) => {
    if (!pricingId) {
      return false;
    }

    try {
      await editPricing(
        getPricingRuleDocument(pricingId, ruleType, nextEnabled, nextRules),
      );
      toast({
        title: toastTitle,
        description: t('changes-saved'),
        variant: 'success',
      });
      return true;
    } catch {
      toast({
        title: errorTitle,
        description: t('unexpected-error'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateRules = async (
    nextRules: PricingRuleConfig[],
    nextEnabled = enabled,
    toastTitle?: string,
  ) => {
    const previousRules = rules;
    const previousEnabled = enabled;

    setRules(nextRules);
    setEnabled(nextEnabled);

    const saved = await persistRules(nextRules, nextEnabled, toastTitle);

    if (!saved) {
      setRules(previousRules);
      setEnabled(previousEnabled);
    }

    return saved;
  };

  const addRule = (rule: PricingRuleConfig) => {
    const nextRule = {
      ...rule,
      _id: rule._id || `${Date.now()}_${rules.length}`,
    };

    return updateRules(
      [...rules, nextRule],
      true,
      t('pricing-rule-added', { rule: title }),
    );
  };

  const updateRule = (rule: PricingRuleConfig) =>
    updateRules(
      rules.map((existingRule) =>
        existingRule._id === rule._id
          ? { ...existingRule, ...rule }
          : existingRule,
      ),
    );

  const deleteRule = (rule: PricingRuleConfig) =>
    updateRules(rules.filter((existingRule) => existingRule._id !== rule._id));

  const deleteRules = (selectedRules: PricingRuleConfig[]) => {
    const selectedRuleSet = new Set(selectedRules);

    return updateRules(rules.filter((rule) => !selectedRuleSet.has(rule)));
  };

  const toggleEnabled = (checked: boolean) => updateRules(rules, checked);

  return {
    addRule,
    deleteRule,
    deleteRules,
    editingRule,
    enabled,
    loading,
    rules,
    setEditingRule,
    toggleEnabled,
    updateRule,
  };
};
