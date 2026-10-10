import {
  IRelationSettingsPurchaseHistory,
  TSegmentFieldNode,
  TSegmentGroupNode,
  TSegmentNode,
  TSegmentRelationNode,
} from 'ui-modules';
import { TTierBand } from '~/modules/loyalties/settings/account-type/tierBands';

export type TTierHistoryPeriod = 'month' | 'quarter' | 'year' | 'custom';

export type TTierHistoryValue = {
  period: TTierHistoryPeriod;
  startDate?: string;
  endDate?: string;
};

export const DEFAULT_TIER_HISTORY: TTierHistoryValue = { period: 'year' };

// Calendar periods in the organization's time zone, read by the segment engine.
const PERIOD_OPERATORS: Record<
  Exclude<TTierHistoryPeriod, 'custom'>,
  string
> = {
  month: 'dtm',
  quarter: 'dtq',
  year: 'dty',
};

const AT_LEAST = 'numberigt';
const AT_MOST = 'numberilt';

// Where the trigger segment's sum sits; the re-enrollment rule names it.
export const TIER_HISTORY_SUM_PATH = 'children.0';

const group = (children: TSegmentNode[]): TSegmentGroupNode => ({
  kind: 'group',
  conjunction: 'and',
  children,
});

const dateCondition = (
  history: IRelationSettingsPurchaseHistory,
  operator: string,
  value?: string,
): TSegmentFieldNode => ({
  kind: 'field',
  contentType: history.relatedType,
  fieldKey: history.dateField,
  operator,
  ...(value ? { value } : {}),
});

const periodConditions = (
  history: IRelationSettingsPurchaseHistory,
  { period, startDate, endDate }: TTierHistoryValue,
): TSegmentFieldNode[] =>
  period === 'custom'
    ? [
        ...(startDate ? [dateCondition(history, 'dateigt', startDate)] : []),
        ...(endDate ? [dateCondition(history, 'dateilt', endDate)] : []),
      ]
    : [dateCondition(history, PERIOD_OPERATORS[period])];

// The source's purchases in its scope and the chosen period, summed.
const purchasesSum = (
  history: IRelationSettingsPurchaseHistory,
  value: TTierHistoryValue,
  operator: string,
  amount: number,
): TSegmentRelationNode => ({
  kind: 'relation',
  relationKey: history.relationKey,
  measure: { op: 'sum', fieldKey: history.amountField },
  child: group([...history.conditions, ...periodConditions(history, value)]),
  operator,
  // The segment form keeps every value as text.
  value: String(amount),
});

const lowestMin = (bands: TTierBand[]) =>
  Math.min(...bands.map(({ min }) => min ?? 0));

/** Buyers whose purchases reach the lowest band: who the automation runs for. */
export const tierHistoryTriggerRoot = (
  history: IRelationSettingsPurchaseHistory,
  value: TTierHistoryValue,
  bands: TTierBand[],
) => group([purchasesSum(history, value, AT_LEAST, lowestMin(bands))]);

/** Buyers whose purchases fall within one tier's band. */
export const tierHistoryBandRoot = (
  history: IRelationSettingsPurchaseHistory,
  value: TTierHistoryValue,
  { min, max }: TTierBand,
) =>
  group([
    ...(min !== undefined ? [purchasesSum(history, value, AT_LEAST, min)] : []),
    ...(max !== undefined ? [purchasesSum(history, value, AT_MOST, max)] : []),
  ]);

export type TTierHistoryIssue = 'no-dates' | 'inverted-dates';

export const tierHistoryIssue = ({
  period,
  startDate,
  endDate,
}: TTierHistoryValue): TTierHistoryIssue | null => {
  if (period !== 'custom') {
    return null;
  }

  if (!startDate && !endDate) {
    return 'no-dates';
  }

  return startDate && endDate && startDate > endDate ? 'inverted-dates' : null;
};
