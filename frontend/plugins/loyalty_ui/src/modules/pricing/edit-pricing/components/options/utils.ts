import type {
  RepeatRuleConfig,
  RepeatRuleType,
} from '@/pricing/edit-pricing/components/repeat/RepeatRuleSheet';
import type { IPricingPlanDetail, IPricingRepeatRule } from '@/pricing/types';

export interface OptionsFormValues {
  departmentIds: string[];
  branchIds: string[];
  boardId: string;
  pipelineId: string;
}

interface OptionsSnapshot {
  departmentIds: string[];
  branchIds: string[];
  boardId: string;
  pipelineId: string;
  repeatRules: Omit<RepeatRuleConfig, '_id'>[];
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
  if (!isoString) {
    return null;
  }

  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};

const timeToIso = (time: string, referenceDate = new Date()): string => {
  const [hours, minutes] = time.split(':');
  const year = referenceDate.getUTCFullYear();
  const month = String(referenceDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(referenceDate.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours.padStart(2, '0')}:${minutes.padStart(
    2,
    '0',
  )}:00.000Z`;
};

export const getRepeatRules = (
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
        weekDay: NUMBER_TO_WEEKDAY[weekValue.value] || weekValue.value,
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

export const mapRepeatRulesToDocument = (
  rules: RepeatRuleConfig[],
  referenceDate = new Date(),
): IPricingRepeatRule[] =>
  rules.map((rule) => {
    const dayKey = rule.weekDay?.toLowerCase() || '';

    return {
      type: rule.ruleType,
      dayStartValue: rule.startTime
        ? timeToIso(rule.startTime, referenceDate)
        : undefined,
      dayEndValue: rule.endTime
        ? timeToIso(rule.endTime, referenceDate)
        : undefined,
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

export const getOptionsSnapshot = ({
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
