import { useState, useEffect } from 'react';
import { InfoCard, Button } from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { IPricingPlanDetail } from '@/pricing/types';
import {
  RepeatRuleSheet,
  type RepeatRuleConfig,
  type RepeatRuleType,
} from '@/pricing/edit-pricing/components/repeat/RepeatRuleSheet';

interface RepeatInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
}

const NUMBER_TO_WEEKDAY: Record<string, string> = {
  '0': 'sunday',
  '1': 'monday',
  '2': 'tuesday',
  '3': 'wednesday',
  '4': 'thursday',
  '5': 'friday',
  '6': 'saturday',
};

const isoToTime = (isoString?: string): string | null => {
  if (!isoString) return null;
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return null;
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return null;
  }
};

export const RepeatInfo: React.FC<RepeatInfoProps> = ({ pricingDetail }) => {
  const [rules, setRules] = useState<RepeatRuleConfig[]>([]);
  const [editingRule, setEditingRule] = useState<RepeatRuleConfig | null>(null);

  useEffect(() => {
    if (pricingDetail) {
      const existingRules = pricingDetail.repeatRules?.map((rule, index) => ({
        _id: `rule_${index}`,
        ruleType: (rule.type || 'everyDay') as RepeatRuleType,
        startTime: isoToTime(rule.dayStartValue),
        endTime: isoToTime(rule.dayEndValue),
        weekDay: rule.weekValue?.[0]?.value
          ? NUMBER_TO_WEEKDAY[rule.weekValue[0].value] ||
            rule.weekValue[0].value
          : null,
        monthDay: rule.monthValue?.[0]?.value || null,
        startDate: rule.yearStartValue || null,
        endDate: rule.yearEndValue || null,
      })) as RepeatRuleConfig[];
      setRules(existingRules || []);
    }
  }, [pricingDetail]);

  const handleRuleAdded = (rule: RepeatRuleConfig) => {
    setRules((prev) => [
      ...prev,
      { ...rule, _id: rule._id || `${Date.now()}_${prev.length}` },
    ]);
  };

  const handleRuleUpdated = (rule: RepeatRuleConfig) => {
    setRules((prev) =>
      prev.map((r) => (r._id === rule._id ? { ...r, ...rule } : r)),
    );
  };

  const handleRuleDelete = (rule: RepeatRuleConfig) => {
    setRules((prev) => prev.filter((r) => r._id !== rule._id));
  };

  return (
    <div className="p-6 space-y-4">
      <InfoCard title="Repeat">
        <InfoCard.Content className="space-y-4">
          <div className="flex justify-end">
            <RepeatRuleSheet
              onRuleAdded={handleRuleAdded}
              onRuleUpdated={handleRuleUpdated}
              editingRule={editingRule}
              onEditComplete={() => setEditingRule(null)}
            />
          </div>

          {rules.length === 0 ? (
            <div className="py-6 text-sm text-center text-muted-foreground">
              No repeat rules yet. Click "Add rule" to add one.
            </div>
          ) : (
            <div className="space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule._id}
                  className="flex items-center px-3 py-2 text-sm border rounded-lg"
                >
                  <div className="flex-1 truncate">{rule.ruleType}</div>

                  <div className="flex justify-end w-20 gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Edit repeat rule"
                      onClick={() => setEditingRule(rule)}
                    >
                      <IconEdit size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive"
                      aria-label="Delete repeat rule"
                      onClick={() => handleRuleDelete(rule)}
                    >
                      <IconTrash size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
