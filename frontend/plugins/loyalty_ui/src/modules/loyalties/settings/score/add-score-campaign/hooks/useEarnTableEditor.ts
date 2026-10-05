import { useFieldArray, UseFormReturn, useWatch } from 'react-hook-form';
import { useLoyaltyAccountTypes } from '../../../account-type/hooks/useLoyaltyAccountTypes';
import { activeTiers } from '../../../account-type/types';
import {
  EarnRowFormValues,
  LoyaltyScoreFormValues,
} from '../../constants/formSchema';
import { emptyEarnRow } from '../../utils/earnTableForm';

export const useEarnTableEditor = (
  form: UseFormReturn<LoyaltyScoreFormValues>,
) => {
  const { control } = form;
  const accountTypeId = useWatch({ control, name: 'accountTypeId' });
  const rowValues = useWatch({ control, name: 'add.table.rows' });
  const { accounts } = useLoyaltyAccountTypes();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'add.table.rows',
  });

  // Tier columns and the money-per-point rate follow the account type.
  const accountType = accounts.find(({ _id }) => _id === accountTypeId);
  const tiers = activeTiers(accountType?.tiers);

  return {
    tiers,
    currencyRatio: accountType?.currencyRatio ?? 1,
    // Tier columns only matter once a row is set per tier.
    byTier: (rowValues || []).some(({ scope }) => scope === 'tiers'),
    // Only bonus rows take a cap; base rows never do.
    hasCap: (rowValues || []).some(({ kind }) => kind !== 'base'),
    rows: fields,
    addRow: (kind: EarnRowFormValues['kind']) => append(emptyEarnRow(kind)),
    removeRow: remove,
    moveRow: move,
  };
};
