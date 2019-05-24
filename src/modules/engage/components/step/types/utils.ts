import { TargetCount } from 'modules/engage/types';

/**
 * Sum selected item's customers count
 * @param ids - customer ids
 * @param countValues - customer counts
 */
export const sumCounts = (ids: string[], countValues: TargetCount): number => {
  let sum = 0;

  for (const id of ids) {
    sum += countValues[id];
  }

  return sum;
};
