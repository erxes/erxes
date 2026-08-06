import { type ComponentType } from 'react';
import { createPortal } from 'react-dom';
import { Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IPricingPlanDetail } from '@/pricing/types';
import { usePricingHeaderActionPortal } from '@/pricing/edit-pricing/PricingHeaderActionPortalContext';
import { PricingRulesTable } from '@/pricing/edit-pricing/components/rules/PricingRulesTable';
import {
  PricingRuleConfig,
  PricingRuleType,
} from '@/pricing/edit-pricing/components/rules/pricingRuleUtils';
import { usePricingRules } from '@/pricing/edit-pricing/components/rules/usePricingRules';

interface PricingRuleSheetProps {
  onRuleAdded?: (config: PricingRuleConfig) => boolean | Promise<boolean>;
  onRuleUpdated?: (config: PricingRuleConfig) => boolean | Promise<boolean>;
  editingRule?: PricingRuleConfig | null;
  onEditComplete?: () => void;
}

interface PricingRuleInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  title: string;
  ruleType: PricingRuleType;
  successTitle: string;
  errorTitle: string;
  RuleSheet: ComponentType<PricingRuleSheetProps>;
}

export const PricingRuleInfo = ({
  pricingId,
  pricingDetail,
  title,
  ruleType,
  successTitle,
  errorTitle,
  RuleSheet,
}: PricingRuleInfoProps) => {
  const { t } = useTranslation('loyalty');
  const headerActionPortal = usePricingHeaderActionPortal();
  const {
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
  } = usePricingRules({
    pricingId,
    pricingDetail,
    ruleType,
    title,
    successTitle,
    errorTitle,
  });
  const disabled = loading || !pricingId;

  const ruleSheet = (
    <RuleSheet
      onRuleAdded={addRule}
      onRuleUpdated={updateRule}
      editingRule={editingRule}
      onEditComplete={() => setEditingRule(null)}
    />
  );

  return (
    <>
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Switch
            checked={enabled}
            onCheckedChange={toggleEnabled}
            disabled={disabled}
          />
          {t('enabled')}
        </label>

        {enabled && (
          <PricingRulesTable
            ruleType={ruleType}
            rules={rules}
            title={title}
            onEdit={setEditingRule}
            onDelete={deleteRule}
            onDeleteMany={deleteRules}
            disabled={disabled}
          />
        )}
      </div>

      {enabled && headerActionPortal
        ? createPortal(ruleSheet, headerActionPortal)
        : null}
    </>
  );
};
