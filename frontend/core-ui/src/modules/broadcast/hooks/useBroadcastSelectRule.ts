import { BROADCAST_RULES } from '@/broadcast/constants';
import { useCallback } from 'react';

/** The messenger rules not added yet; picking one passes its title along. */
export const useBroadcastSelectRule = (
  values: Record<string, string>[],
  onValueChange: (value: string, title: string) => void,
) => {
  const availableRules = Object.keys(BROADCAST_RULES)
    .filter((key) => !values.some((field) => field.rule === key))
    .map((key) => ({ key, ...BROADCAST_RULES[key] }));

  const selectRule = useCallback(
    (value: string) => onValueChange(value, BROADCAST_RULES[value].title),
    [onValueChange],
  );

  return { availableRules, selectRule };
};
