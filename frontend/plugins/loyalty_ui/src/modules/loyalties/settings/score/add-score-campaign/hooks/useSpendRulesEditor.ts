import { UseFormReturn, useWatch } from 'react-hook-form';
import { useLoyaltyAccountTypes } from '../../../account-type/hooks/useLoyaltyAccountTypes';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';

export const useSpendRulesEditor = (
  form: UseFormReturn<LoyaltyScoreFormValues>,
) => {
  const { control } = form;
  const accountTypeId = useWatch({ control, name: 'accountTypeId' });
  const { accounts } = useLoyaltyAccountTypes();
  const accountType = accounts.find(({ _id }) => _id === accountTypeId);

  return {
    pointValue: accountType?.pointValue ?? 1,
  };
};
