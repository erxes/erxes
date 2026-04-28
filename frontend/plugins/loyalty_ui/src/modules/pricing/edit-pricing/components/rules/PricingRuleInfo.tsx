import {
  useCallback,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Button, InfoCard, useToast } from 'erxes-ui';
import { useEditPricing } from '@/pricing/hooks/useEditPricing';
import {
  IPricingExpiryRule,
  IPricingPlanDetail,
  IPricingPriceRule,
  IPricingQuantityRule,
} from '@/pricing/types';
import {
  DiscountType,
  PriceAdjustType,
} from '@/pricing/edit-pricing/components';

export interface PricingRuleConfig {
  _id?: string;
  ruleType: string;
  ruleValue: string;
  discountType: DiscountType;
  discountValue: string;
  priceAdjustType: PriceAdjustType;
  priceAdjustFactor: string;
  bonusProductId?: string | null;
}

type PricingRulePayload =
  | IPricingQuantityRule
  | IPricingPriceRule
  | IPricingExpiryRule;

type PricingRuleField = 'quantityRules' | 'priceRules' | 'expiryRules';
type PricingRuleEnabledField =
  | 'isQuantityEnabled'
  | 'isPriceEnabled'
  | 'isExpiryEnabled';

interface PricingRuleSheetProps<T extends PricingRuleConfig> {
  onRuleAdded?: (config: T) => void;
  onRuleUpdated?: (config: T) => void;
  editingRule?: T | null;
  onEditComplete?: () => void;
}

interface PricingRuleInfoProps<T extends PricingRuleConfig> {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  embedded?: boolean;
  onSaveActionChange?: (action: ReactNode | null) => void;
  title: string;
  rulesKey: PricingRuleField;
  enabledKey: PricingRuleEnabledField;
  successTitle: string;
  errorTitle: string;
  emptyMessage: ReactNode;
  RuleSheet: ComponentType<PricingRuleSheetProps<T>>;
}

const mapRuleToConfig = (
  rule: PricingRulePayload,
  index: number,
): PricingRuleConfig => ({
  _id: `rule_${index}`,
  ruleType: rule.type || 'exact',
  ruleValue: String(rule.value || ''),
  discountType: (rule.discountType || 'default') as DiscountType,
  discountValue: String(rule.discountValue || ''),
  priceAdjustType: (rule.priceAdjustType || 'none') as PriceAdjustType,
  priceAdjustFactor: String(rule.priceAdjustFactor || ''),
  bonusProductId: rule.discountBonusProduct || null,
});

const mapConfigToRule = (rule: PricingRuleConfig): PricingRulePayload => ({
  type: rule.ruleType,
  value: Number(rule.ruleValue) || 0,
  discountType: rule.discountType,
  discountValue: Number(rule.discountValue) || 0,
  discountBonusProduct: rule.bonusProductId || '',
  priceAdjustType: rule.priceAdjustType,
  priceAdjustFactor: Number(rule.priceAdjustFactor) || 0,
});

export const PricingRuleInfo = <T extends PricingRuleConfig>({
  pricingId,
  pricingDetail,
  embedded = false,
  onSaveActionChange,
  title,
  rulesKey,
  enabledKey,
  successTitle,
  errorTitle,
  emptyMessage,
  RuleSheet,
}: PricingRuleInfoProps<T>) => {
  const [rules, setRules] = useState<T[]>([]);
  const [editingRule, setEditingRule] = useState<T | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const { editPricing, loading } = useEditPricing();
  const { toast } = useToast();

  useEffect(() => {
    if (!pricingDetail) {
      return;
    }

    const detailRules = pricingDetail[rulesKey] as
      | PricingRulePayload[]
      | undefined;

    setRules((detailRules?.map(mapRuleToConfig) || []) as T[]);
    setEnabled(pricingDetail[enabledKey] ?? !!detailRules?.length);
    setHasChanges(false);
    setInitialLoaded(true);
  }, [enabledKey, pricingDetail, rulesKey]);

  const markChanged = () => {
    if (initialLoaded) {
      setHasChanges(true);
    }
  };

  const handleRuleAdded = (rule: T) => {
    setRules((prev) => [
      ...prev,
      { ...rule, _id: rule._id || `${Date.now()}_${prev.length}` },
    ]);
    markChanged();
  };

  const handleRuleUpdated = (rule: T) => {
    setRules((prev) =>
      prev.map((existingRule) =>
        existingRule._id === rule._id
          ? { ...existingRule, ...rule }
          : existingRule,
      ),
    );
    markChanged();
  };

  const handleRuleDelete = (rule: T) => {
    setRules((prev) =>
      prev.filter((existingRule) => existingRule._id !== rule._id),
    );
    markChanged();
  };

  const handleSaveAll = useCallback(async () => {
    if (!pricingId) {
      return;
    }

    const mappedRules = rules.map(mapConfigToRule);

    try {
      await editPricing({
        _id: pricingId,
        [enabledKey]: enabled,
        [rulesKey]: mappedRules,
      } as Parameters<typeof editPricing>[0]);
      setHasChanges(false);
      toast({
        title: successTitle,
        description: 'Changes have been saved successfully.',
      });
    } catch {
      toast({
        title: errorTitle,
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }, [
    editPricing,
    enabled,
    enabledKey,
    errorTitle,
    pricingId,
    rules,
    rulesKey,
    successTitle,
    toast,
  ]);

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      hasChanges ? (
        <Button
          type="button"
          size="sm"
          onClick={handleSaveAll}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      ) : null,
    );

    return () => onSaveActionChange(null);
  }, [hasChanges, loading, onSaveActionChange, handleSaveAll]);

  const content = (
    <div className="space-y-4">
      <div className="flex justify-end">
        <RuleSheet
          onRuleAdded={handleRuleAdded}
          onRuleUpdated={handleRuleUpdated}
          editingRule={editingRule}
          onEditComplete={() => setEditingRule(null)}
        />
      </div>

      {rules.length === 0 ? (
        <div className="py-6 text-sm text-center text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-1 px-3 text-sm font-medium text-muted-foreground">
            <div className="flex-1">Rule type</div>
            <div className="flex-1">Rule value</div>
            <div className="flex-1">Discount type</div>
            <div className="flex-1">Discount value</div>
            <div className="flex-1">Price adjust type</div>
            <div className="flex-1">Price adjust factor</div>
            <div className="w-20 text-center">Actions</div>
          </div>

          {rules.map((rule) => (
            <div
              key={rule._id}
              className="flex items-center px-3 py-2 text-sm border rounded-lg"
            >
              <div className="flex-1 truncate">{rule.ruleType}</div>
              <div className="flex-1 truncate">{rule.ruleValue}</div>
              <div className="flex-1 truncate">{rule.discountType}</div>
              <div className="flex-1 truncate">{rule.discountValue}</div>
              <div className="flex-1 truncate">{rule.priceAdjustType}</div>
              <div className="flex-1 truncate">{rule.priceAdjustFactor}</div>
              <div className="flex justify-center w-20 gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Edit ${title.toLowerCase()} rule`}
                  onClick={() => setEditingRule(rule)}
                >
                  <IconEdit size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive"
                  aria-label={`Delete ${title.toLowerCase()} rule`}
                  onClick={() => handleRuleDelete(rule)}
                >
                  <IconTrash size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="p-6 space-y-4">
      <InfoCard title={title}>
        <InfoCard.Content className="space-y-4">{content}</InfoCard.Content>
      </InfoCard>
    </div>
  );
};
