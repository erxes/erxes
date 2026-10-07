import { TFunction } from 'i18next';
import { TEarnCalc } from '../types/earnCalc';

const num = (value: number) =>
  Number(value.toFixed(4)).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });

const money = (value: number) => `${num(value)}₮`;

/** The arithmetic of one earning row, a line per step. */
export const earnCalcSteps = (calc: TEarnCalc, t: TFunction): string[] => {
  const { valueType, value, amount, ratio, basePoints, cap } = calc;

  if (valueType === 'fixed') {
    return [t('earn-calc-fixed', { value: num(value) })];
  }

  if (basePoints !== undefined) {
    return [
      t('earn-calc-bonus-multiplier', {
        base: num(basePoints),
        value: num(value),
        points: num(basePoints * Math.max(value - 1, 0)),
      }),
      ...(cap !== undefined ? [t('earn-calc-cap', { cap: num(cap) })] : []),
    ];
  }

  const counted = amount ?? 0;
  const earnedMoney =
    valueType === 'multiplier' ? counted * value : (counted * value) / 100;
  const perPoint = ratio && ratio > 0 ? ratio : 1;

  return [
    t(
      valueType === 'multiplier' ? 'earn-calc-multiplier' : 'earn-calc-percent',
      { amount: money(counted), value: num(value), money: money(earnedMoney) },
    ),
    t('earn-calc-ratio', {
      money: money(earnedMoney),
      ratio: money(perPoint),
      points: num(earnedMoney / perPoint),
    }),
    ...(cap !== undefined ? [t('earn-calc-cap', { cap: num(cap) })] : []),
  ];
};

export const formatCalcMoney = money;
export const formatCalcNumber = num;
