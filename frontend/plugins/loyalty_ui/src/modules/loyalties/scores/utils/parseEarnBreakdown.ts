import { isRecord } from '@/loyalties/utils/isRecord';
import { TEarnBreakdownItem, TEarnCalc } from '../types/earnCalc';

const VALUE_TYPES: TEarnCalc['valueType'][] = [
  'percent',
  'fixed',
  'multiplier',
];

const optionalNumber = (value: unknown) =>
  typeof value === 'number' ? value : undefined;

const parseEarnCalc = (value: unknown): TEarnCalc | null => {
  if (!isRecord(value)) {
    return null;
  }

  const valueType = VALUE_TYPES.find((type) => type === value.valueType);

  if (
    !valueType ||
    typeof value.value !== 'number' ||
    typeof value.column !== 'string'
  ) {
    return null;
  }

  return {
    valueType,
    value: value.value,
    column: value.column,
    amount: optionalNumber(value.amount),
    ratio: optionalNumber(value.ratio),
    basePoints: optionalNumber(value.basePoints),
    cap: optionalNumber(value.cap),
    pointValue: optionalNumber(value.pointValue),
  };
};

export const parseEarnBreakdown = (value: unknown): TEarnBreakdownItem[] =>
  Array.isArray(value)
    ? value.flatMap((item) =>
        isRecord(item) && typeof item.points === 'number'
          ? [
              {
                rowKey: typeof item.rowKey === 'string' ? item.rowKey : '',
                name: typeof item.name === 'string' ? item.name : '',
                points: item.points,
                calc: parseEarnCalc(item.calc),
              },
            ]
          : [],
      )
    : [];
