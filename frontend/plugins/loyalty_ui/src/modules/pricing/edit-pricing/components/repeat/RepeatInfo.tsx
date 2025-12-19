import { useState, useEffect } from 'react';
import { InfoCard, Switch, Label, Button, useToast } from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { IPricingPlanDetail } from '@/pricing/types';
import { useEditPricing } from '@/pricing/hooks/useEditPricing';
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
    if (isNaN(date.getTime())) return null;
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return null;
  }
};

export const RepeatInfo: React.FC<RepeatInfoProps> = ({
  pricingId,
  pricingDetail,
}) => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [rules, setRules] = useState<RepeatRuleConfig[]>([]);
  const [editingRule, setEditingRule] = useState<RepeatRuleConfig | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const { editPricing, loading } = useEditPricing();
  const { toast } = useToast();

  useEffect(() => {
    if (pricingDetail) {
      setEnabled(pricingDetail.isRepeatEnabled ?? false);
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
      setHasChanges(false);
      setInitialLoaded(true);
    }
  }, [pricingDetail]);

  const handleRuleAdded = (rule: RepeatRuleConfig) => {
    setRules((prev) => [
      ...prev,
      { ...rule, _id: rule._id || `${Date.now()}_${prev.length}` },
    ]);
    if (initialLoaded) setHasChanges(true);
  };

  const handleRuleUpdated = (rule: RepeatRuleConfig) => {
    setRules((prev) =>
      prev.map((r) => (r._id === rule._id ? { ...r, ...rule } : r)),
    );
    if (initialLoaded) setHasChanges(true);
  };

  const handleRuleDelete = (rule: RepeatRuleConfig) => {
    setRules((prev) => prev.filter((r) => r._id !== rule._id));
    if (initialLoaded) setHasChanges(true);
  };

  const handleEnabledChange = (checked: boolean) => {
    setEnabled(checked);
    if (initialLoaded) setHasChanges(true);
  };

  const weekDayToNumber: Record<string, string> = {
    monday: '1',
    tuesday: '2',
    wednesday: '3',
    thursday: '4',
    friday: '5',
    saturday: '6',
    sunday: '0',
  };

  const weekDayToLabel: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };

  const handleSaveAll = async () => {
    if (!pricingId) return;

    const timeToIso = (time: string): string => {
      const [hours, minutes] = time.split(':');
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours.padStart(
        2,
        '0',
      )}:${minutes.padStart(2, '0')}:00.000Z`;
    };

    const repeatRules = rules.map((rule) => {
      const dayKey = rule.weekDay?.toLowerCase() || '';

      return {
        type: rule.ruleType,
        dayStartValue: rule.startTime ? timeToIso(rule.startTime) : undefined,
        dayEndValue: rule.endTime ? timeToIso(rule.endTime) : undefined,
        weekValue: rule.weekDay
          ? [
              {
                label: weekDayToLabel[dayKey] || rule.weekDay,
                value: weekDayToNumber[dayKey] || rule.weekDay,
              },
            ]
          : undefined,
        monthValue: rule.monthDay
          ? [{ label: rule.monthDay, value: rule.monthDay }]
          : undefined,
        yearStartValue: rule.startDate || undefined,
        yearEndValue: rule.endDate || undefined,
      };
    });

    try {
      await editPricing({
        _id: pricingId,
        isRepeatEnabled: enabled,
        repeatRules,
      });
      toast({
        title: 'Repeat rules updated',
        description: 'Changes have been saved successfully.',
      });
    } catch {
      toast({
        title: 'Failed to update repeat rules',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <InfoCard title="Repeat">
        <InfoCard.Content className="space-y-4">
          <div className="flex gap-2 items-center">
            <Label>SET REPEAT</Label>
            <Switch checked={enabled} onCheckedChange={handleEnabledChange} />
          </div>

          {enabled && (
            <>
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
                      className="flex items-center px-3 py-2 text-sm rounded-lg border"
                    >
                      <div className="flex-1 truncate">{rule.ruleType}</div>

                      <div className="w-[80px] flex justify-end gap-1">
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
