import { Control, useController, useWatch } from 'react-hook-form';
import { LOYALTY_RULE_TYPES } from '../constants';
import { TTierBandsValue } from '../tierBands';
import { TLoyaltyTierRuleRow, TLoyaltyTierRulesForm } from '../types';
import { useLoyaltyTierWallets } from './useLoyaltyTierWallets';

// Only one tier rule decides a stage, so a narrower one replaces any wider.
const overridesWider = (
  row: TLoyaltyTierRuleRow,
  rows: TLoyaltyTierRuleRow[],
) =>
  row.type !== LOYALTY_RULE_TYPES.EVERY_BOARD &&
  rows.some(
    (other) =>
      other !== row &&
      (other.type === LOYALTY_RULE_TYPES.EVERY_BOARD ||
        (row.type === LOYALTY_RULE_TYPES.SPECIFIC_STAGES &&
          other.type === LOYALTY_RULE_TYPES.EVERY_PIPELINE &&
          other.boardId === row.boardId)),
  );

/** One tier rule's wallet and bands, kept in step with each other. */
export const useLoyaltyTierRuleRow = (
  control: Control<TLoyaltyTierRulesForm>,
  index: number,
) => {
  const { tiersOf } = useLoyaltyTierWallets();
  const rows = useWatch({ control, name: 'rules' }) || [];
  const row = rows[index];
  const bands = useController({ control, name: `rules.${index}.bands` });
  const onlyUpgrade = useController({
    control,
    name: `rules.${index}.onlyUpgrade`,
  });

  return {
    boardId: row?.boardId,
    pipelineId: row?.pipelineId,
    accountTypeId: row?.accountTypeId,
    // Another wallet's tiers have other keys; its bands start empty.
    resetBands: () => bands.field.onChange([]),
    tiers: tiersOf(row?.accountTypeId),
    bandsValue: {
      bands: bands.field.value,
      onlyUpgrade: onlyUpgrade.field.value,
    },
    bandsError: bands.fieldState.error?.message,
    changeBands: ({ bands: next, onlyUpgrade: upgrade }: TTierBandsValue) => {
      bands.field.onChange(next);
      onlyUpgrade.field.onChange(upgrade);
    },
    overrides: !!row && overridesWider(row, rows),
  };
};
