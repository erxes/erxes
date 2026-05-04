import { useEffect, useState, type ReactNode } from 'react';
import { Button, Form, InfoCard, Label, useToast } from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { IPricingPlanDetail } from '@/pricing/types';
import { useEditPricing } from '@/pricing/hooks/useEditPricing';
import { SelectBoardFormItem } from '@/pricing/hooks/useSelectBoard';
import { SelectPipelineFormItem } from '@/pricing/hooks/useSelectPipeline';
import {
  RepeatRuleSheet,
  type RepeatRuleConfig,
  type RepeatRuleType,
} from '@/pricing/edit-pricing/components/repeat/RepeatRuleSheet';

interface OptionsInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

interface OptionsFormValues {
  departmentIds: string[];
  branchIds: string[];
  boardId: string;
  pipelineId: string;
}

interface OptionsSnapshot extends OptionsFormValues {
  repeatRules: RepeatRuleConfig[];
}

const OPTIONS_FORM_ID = 'pricing-options-form';

const NUMBER_TO_WEEKDAY: Record<string, string> = {
  '0': 'sunday',
  '1': 'monday',
  '2': 'tuesday',
  '3': 'wednesday',
  '4': 'thursday',
  '5': 'friday',
  '6': 'saturday',
};

const WEEKDAY_TO_NUMBER: Record<string, string> = {
  monday: '1',
  tuesday: '2',
  wednesday: '3',
  thursday: '4',
  friday: '5',
  saturday: '6',
  sunday: '0',
};

const WEEKDAY_TO_LABEL: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const getWeekDayFromValue = (value: string) =>
  NUMBER_TO_WEEKDAY[value] || value;

const getRepeatRuleType = (value?: string): RepeatRuleType => {
  switch (value) {
    case 'everyYear':
    case 'everyMonth':
    case 'everyWeek':
    case 'everyDay':
      return value;
    default:
      return 'everyDay';
  }
};

const isoToTime = (isoString?: string): string | null => {
  if (!isoString) return null;

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;

  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};

const timeToIso = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours.padStart(2, '0')}:${minutes.padStart(
    2,
    '0',
  )}:00.000Z`;
};

const getRepeatRules = (
  pricingDetail?: IPricingPlanDetail,
): RepeatRuleConfig[] =>
  pricingDetail?.repeatRules?.flatMap((rule, index): RepeatRuleConfig[] => {
    const baseRule: Omit<RepeatRuleConfig, '_id' | 'weekDay' | 'monthDay'> = {
      ruleType: getRepeatRuleType(rule.type),
      startTime: isoToTime(rule.dayStartValue),
      endTime: isoToTime(rule.dayEndValue),
      startDate: rule.yearStartValue || null,
      endDate: rule.yearEndValue || null,
    };

    if (rule.weekValue?.length) {
      return rule.weekValue.map((weekValue, weekIndex) => ({
        ...baseRule,
        _id: `rule_${index}_week_${weekIndex}`,
        weekDay: getWeekDayFromValue(weekValue.value),
        monthDay: null,
      }));
    }

    if (rule.monthValue?.length) {
      return rule.monthValue.map((monthValue, monthIndex) => ({
        ...baseRule,
        _id: `rule_${index}_month_${monthIndex}`,
        weekDay: null,
        monthDay: monthValue.value,
      }));
    }

    return [
      {
        ...baseRule,
        _id: `rule_${index}`,
        weekDay: null,
        monthDay: null,
      },
    ];
  }) || [];

const normalizeIds = (values: string[] = []) =>
  [...values].filter(Boolean).sort((a, b) => a.localeCompare(b));

const normalizeRepeatRules = (rules: RepeatRuleConfig[] = []) =>
  rules.map((rule) => ({
    ruleType: rule.ruleType,
    startTime: rule.startTime || null,
    endTime: rule.endTime || null,
    weekDay: rule.weekDay || null,
    monthDay: rule.monthDay || null,
    startDate: rule.startDate || null,
    endDate: rule.endDate || null,
  }));

const getOptionsSnapshot = ({
  values,
  repeatRules,
}: {
  values: OptionsFormValues;
  repeatRules: RepeatRuleConfig[];
}): OptionsSnapshot => ({
  departmentIds: normalizeIds(values.departmentIds),
  branchIds: normalizeIds(values.branchIds),
  boardId: values.boardId || '',
  pipelineId: values.pipelineId || '',
  repeatRules: normalizeRepeatRules(repeatRules),
});

export const OptionsInfo = ({
  pricingId,
  pricingDetail,
  onSaveActionChange,
}: OptionsInfoProps) => {
  const { editPricing, loading } = useEditPricing();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [repeatRules, setRepeatRules] = useState<RepeatRuleConfig[]>([]);
  const [editingRule, setEditingRule] = useState<RepeatRuleConfig | null>(null);
  const [initialSnapshot, setInitialSnapshot] =
    useState<OptionsSnapshot | null>(null);

  const form = useForm<OptionsFormValues>({
    defaultValues: {
      departmentIds: [],
      branchIds: [],
      boardId: '',
      pipelineId: '',
    },
  });

  const { control, handleSubmit, reset, setValue } = form;

  const watchedValues = form.watch();
  const currentSnapshot = getOptionsSnapshot({
    values: watchedValues,
    repeatRules,
  });
  const hasChanges =
    !!initialSnapshot &&
    JSON.stringify(initialSnapshot) !== JSON.stringify(currentSnapshot);

  useEffect(() => {
    if (!pricingDetail) {
      return;
    }

    const departmentIds = pricingDetail.departmentIds || [];
    const branchIds = pricingDetail.branchIds || [];
    const rules = getRepeatRules(pricingDetail);

    reset({
      departmentIds,
      branchIds,
      boardId: pricingDetail.boardId || '',
      pipelineId: pricingDetail.pipelineId || '',
    });

    setRepeatRules(rules);
    setInitialSnapshot(
      getOptionsSnapshot({
        values: {
          departmentIds,
          branchIds,
          boardId: pricingDetail.boardId || '',
          pipelineId: pricingDetail.pipelineId || '',
        },
        repeatRules: rules,
      }),
    );
  }, [pricingDetail, reset]);

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      hasChanges ? (
        <Button
          type="submit"
          form={OPTIONS_FORM_ID}
          size="sm"
          disabled={loading}
        >
          {loading
            ? t('loyalty.options.saving', { defaultValue: 'Saving...' })
            : t('loyalty.options.saveChanges', {
                defaultValue: 'Save Changes',
              })}
        </Button>
      ) : null,
    );

    return () => onSaveActionChange(null);
  }, [hasChanges, loading, onSaveActionChange, t]);

  const handleBoardChange = (value: string) => {
    setValue('boardId', value, { shouldDirty: true });
    setValue('pipelineId', '', { shouldDirty: true });
  };

  const handleRuleAdded = (rule: RepeatRuleConfig) => {
    setRepeatRules((prev) => [
      ...prev,
      { ...rule, _id: rule._id || `${Date.now()}_${prev.length}` },
    ]);
  };

  const handleRuleUpdated = (rule: RepeatRuleConfig) => {
    setRepeatRules((prev) =>
      prev.map((existingRule) =>
        existingRule._id === rule._id
          ? { ...existingRule, ...rule }
          : existingRule,
      ),
    );
  };

  const handleRuleDelete = (rule: RepeatRuleConfig) => {
    setRepeatRules((prev) =>
      prev.filter((existingRule) => existingRule._id !== rule._id),
    );
  };

  const handleSave = async (values: OptionsFormValues) => {
    if (!pricingId) return;

    const mappedRepeatRules = repeatRules.map((rule) => {
      const dayKey = rule.weekDay?.toLowerCase() || '';

      return {
        type: rule.ruleType,
        dayStartValue: rule.startTime ? timeToIso(rule.startTime) : undefined,
        dayEndValue: rule.endTime ? timeToIso(rule.endTime) : undefined,
        weekValue: rule.weekDay
          ? [
              {
                label: WEEKDAY_TO_LABEL[dayKey] || rule.weekDay,
                value: WEEKDAY_TO_NUMBER[dayKey] || rule.weekDay,
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

    const departmentIds = values.departmentIds;
    const branchIds = values.branchIds;
    const boardId = values.boardId || null;
    const pipelineId = values.pipelineId || null;
    const nextRepeatRules = mappedRepeatRules;

    try {
      await editPricing({
        _id: pricingId,
        departmentIds,
        branchIds,
        boardId,
        pipelineId,
        stageId: null,
        isRepeatEnabled: nextRepeatRules.length > 0,
        repeatRules: nextRepeatRules,
      });

      reset({
        departmentIds,
        branchIds,
        boardId: boardId || '',
        pipelineId: pipelineId || '',
      });
      setInitialSnapshot(
        getOptionsSnapshot({
          values: {
            departmentIds,
            branchIds,
            boardId: boardId || '',
            pipelineId: pipelineId || '',
          },
          repeatRules,
        }),
      );

      toast({
        title: t('loyalty.options.updated', {
          defaultValue: 'Options updated',
        }),
        description: t('loyalty.options.savedDescription', {
          defaultValue: 'Changes have been saved successfully.',
        }),
      });
    } catch {
      toast({
        title: t('loyalty.options.updateFailed', {
          defaultValue: 'Failed to update options',
        }),
        description: t('loyalty.options.unexpectedError', {
          defaultValue: 'An unexpected error occurred.',
        }),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6">
      <InfoCard title="Options">
        <InfoCard.Content>
          <Form {...form}>
            <form
              id={OPTIONS_FORM_ID}
              onSubmit={handleSubmit(handleSave)}
              className="space-y-8"
              noValidate
            >
              <div className="flex items-center my-4">
                <div className="flex-1 border-t" />
                <Label className="mx-2">
                  {t('loyalty.options.location', { defaultValue: 'Location' })}
                </Label>
                <div className="flex-1 border-t" />
              </div>

              <section className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    control={control}
                    name="departmentIds"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          {t('loyalty.options.departments', {
                            defaultValue: 'DEPARTMENTS',
                          })}
                        </Form.Label>
                        <Form.Control>
                          <SelectDepartments.FormItem
                            mode="multiple"
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={control}
                    name="branchIds"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          {t('loyalty.options.branches', {
                            defaultValue: 'BRANCHES',
                          })}
                        </Form.Label>
                        <Form.Control>
                          <SelectBranches.FormItem
                            mode="multiple"
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                </div>
              </section>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t" />
                <Label className="mx-2">
                  {t('loyalty.options.pipeline', { defaultValue: 'Pipeline' })}
                </Label>
                <div className="flex-1 border-t" />
              </div>

              <section className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    control={control}
                    name="boardId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          {t('loyalty.options.board', {
                            defaultValue: 'BOARD',
                          })}
                        </Form.Label>
                        <Form.Control>
                          <SelectBoardFormItem
                            value={field.value}
                            onValueChange={handleBoardChange}
                            placeholder={t('loyalty.options.chooseBoard', {
                              defaultValue: 'Choose a board',
                            })}
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={control}
                    name="pipelineId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          {t('loyalty.options.pipelineUpper', {
                            defaultValue: 'PIPELINE',
                          })}
                        </Form.Label>
                        <Form.Control>
                          <SelectPipelineFormItem
                            value={field.value}
                            onValueChange={field.onChange}
                            boardId={form.watch('boardId')}
                            placeholder={t('loyalty.options.choosePipeline', {
                              defaultValue: 'Choose a pipeline',
                            })}
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                </div>
              </section>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t" />
                <Label className="mx-2">
                  {t('loyalty.options.repeat', { defaultValue: 'Repeat' })}
                </Label>
                <div className="flex-1 border-t" />
              </div>

              <section className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <RepeatRuleSheet
                      onRuleAdded={handleRuleAdded}
                      onRuleUpdated={handleRuleUpdated}
                      editingRule={editingRule}
                      onEditComplete={() => setEditingRule(null)}
                    />
                  </div>

                  {repeatRules.length === 0 ? (
                    <div className="py-6 text-sm text-center text-muted-foreground">
                      {t('loyalty.options.noRepeatRules', {
                        defaultValue:
                          'No repeat rules yet. Click "Add rule" to add one.',
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {repeatRules.map((rule) => (
                        <div
                          key={rule._id}
                          className="flex items-center px-3 py-2 text-sm border rounded-lg"
                        >
                          <div className="flex-1 truncate">{rule.ruleType}</div>

                          <div className="flex justify-end w-20 gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              type="button"
                              aria-label={t('loyalty.options.editRepeatRule', {
                                defaultValue: 'Edit repeat rule',
                              })}
                              onClick={() => setEditingRule(rule)}
                            >
                              <IconEdit size={14} />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              type="button"
                              className="text-destructive"
                              aria-label={t(
                                'loyalty.options.deleteRepeatRule',
                                {
                                  defaultValue: 'Delete repeat rule',
                                },
                              )}
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
              </section>
            </form>
          </Form>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
