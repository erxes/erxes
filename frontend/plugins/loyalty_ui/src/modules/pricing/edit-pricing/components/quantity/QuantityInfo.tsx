import { useState, useEffect } from 'react';
import { InfoCard, Switch, Label, Button, useToast } from 'erxes-ui';
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
}

export const QuantityInfo = ({
  pricingId,
  pricingDetail,
}: QuantityInfoProps) => {
  const [enabled, setEnabled] = useState<boolean>(false);
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
      setEnabled(pricingDetail.isQuantityEnabled ?? false);
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

  const handleEnabledChange = (checked: boolean) => {
    setEnabled(checked);
    if (initialLoaded) setHasChanges(true);
  };

  const handleSaveAll = async () => {
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
        isQuantityEnabled: enabled,
        quantityRules,
      });
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
  };

  return (
    <div className="p-6 space-y-4">
      <InfoCard title="Quantity">
        <InfoCard.Content className="space-y-4">
          <div className="flex gap-2 items-center">
            <Label>ENABLE QUANTITY RULE</Label>
            <Switch checked={enabled} onCheckedChange={handleEnabledChange} />
          </div>

          {enabled && (
            <>
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
                      className="flex items-center px-3 py-2 text-sm rounded-lg border"
                    >
                      <div className="flex-1 truncate">{rule.ruleType}</div>
                      <div className="flex-1 truncate">{rule.ruleValue}</div>
                      <div className="flex-1 truncate">{rule.discountType}</div>
                      <div className="flex-1 truncate">
                        {rule.discountValue}
                      </div>
                      <div className="flex-1 truncate">
                        {rule.priceAdjustType}
                      </div>
                      <div className="flex-1 truncate">
                        {rule.priceAdjustFactor}
                      </div>
                      <div className="flex gap-1 justify-center w-20">
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
            </>
          )}

          {hasChanges && (
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSaveAll} disabled={loading}>
                Save Changes
              </Button>
            </div>
          )}
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
