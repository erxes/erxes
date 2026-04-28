import { useCallback, useState, useEffect, type ReactNode } from 'react';
import { InfoCard, Button, useToast } from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { IPricingPlanDetail } from '@/pricing/types';
import { useEditPricing } from '@/pricing/hooks/useEditPricing';
import {
  QuantityRuleSheet,
  type QuantityRuleConfig,
} from '@/pricing/edit-pricing/components/quantity/QuantityRuleSheet';

interface QuantityInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  embedded?: boolean;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

export const QuantityInfo = ({
  pricingId,
  pricingDetail,
  embedded = false,
  onSaveActionChange,
}: QuantityInfoProps) => {
  const [rules, setRules] = useState<QuantityRuleConfig[]>([]);
  const [editingRule, setEditingRule] = useState<QuantityRuleConfig | null>(
    null,
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const { editPricing, loading } = useEditPricing();
  const { toast } = useToast();

  useEffect(() => {
    if (pricingDetail) {
      const existingRules = pricingDetail.quantityRules?.map((rule, index) => ({
        _id: `rule_${index}`,
        ruleType: rule.type || 'exact',
        ruleValue: String(rule.value || ''),
        discountType: rule.discountType || 'default',
        discountValue: String(rule.discountValue || ''),
        priceAdjustType: rule.priceAdjustType || 'none',
        priceAdjustFactor: String(rule.priceAdjustFactor || ''),
        bonusProductId: rule.discountBonusProduct || null,
      })) as QuantityRuleConfig[];
      setRules(existingRules || []);
      setHasChanges(false);
      setInitialLoaded(true);
    }
  }, [pricingDetail]);

  const handleRuleAdded = (rule: QuantityRuleConfig) => {
    setRules((prev) => [
      ...prev,
      { ...rule, _id: rule._id || `${Date.now()}_${prev.length}` },
    ]);
    if (initialLoaded) setHasChanges(true);
  };

  const handleRuleUpdated = (rule: QuantityRuleConfig) => {
    setRules((prev) =>
      prev.map((r) => (r._id === rule._id ? { ...r, ...rule } : r)),
    );
    if (initialLoaded) setHasChanges(true);
  };

  const handleRuleDelete = (rule: QuantityRuleConfig) => {
    setRules((prev) => prev.filter((r) => r._id !== rule._id));
    if (initialLoaded) setHasChanges(true);
  };

  const handleSaveAll = useCallback(async () => {
    if (!pricingId) return;

    const quantityRules = rules.map((rule) => ({
      type: rule.ruleType,
      value: Number(rule.ruleValue) || 0,
      discountType: rule.discountType,
      discountValue: Number(rule.discountValue) || 0,
      discountBonusProduct: rule.bonusProductId || '',
      priceAdjustType: rule.priceAdjustType,
      priceAdjustFactor: Number(rule.priceAdjustFactor) || 0,
    }));

    try {
      await editPricing({
        _id: pricingId,
        isQuantityEnabled: quantityRules.length > 0,
        quantityRules,
      });
      setHasChanges(false);
      toast({
        title: 'Quantity rules updated',
        description: 'Changes have been saved successfully.',
      });
    } catch {
      toast({
        title: 'Failed to update quantity rules',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }, [editPricing, pricingId, rules, toast]);

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
        <QuantityRuleSheet
          onRuleAdded={handleRuleAdded}
          onRuleUpdated={handleRuleUpdated}
          editingRule={editingRule}
          onEditComplete={() => setEditingRule(null)}
        />
      </div>

      {rules.length === 0 ? (
        <div className="py-6 text-sm text-center text-muted-foreground">
          No quantity rules yet. Click "Add rule" to add one.
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
                  onClick={() => setEditingRule(rule)}
                >
                  <IconEdit size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive"
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
      <InfoCard title="Quantity">
        <InfoCard.Content className="space-y-4">{content}</InfoCard.Content>
      </InfoCard>
    </div>
  );
};
