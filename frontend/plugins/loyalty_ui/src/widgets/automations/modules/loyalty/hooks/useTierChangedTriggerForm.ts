import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useLoyaltyAccountTypes } from '~/modules/loyalties/settings/account-type/hooks/useLoyaltyAccountTypes';
import { activeTiers } from '~/modules/loyalties/settings/account-type/types';
import {
  tierChangedTriggerConfigFormSchema,
  TTierChangedTriggerConfigForm,
} from '../states/tierChangedTriggerConfigFormDefinitions';

export const useTierChangedTriggerForm = (
  currentConfig?: Partial<TTierChangedTriggerConfigForm>,
) => {
  const form = useForm<TTierChangedTriggerConfigForm>({
    resolver: zodResolver(tierChangedTriggerConfigFormSchema),
    defaultValues: {
      accountTypeId: '',
      toTier: '',
      direction: 'up',
      ...currentConfig,
    },
  });
  const accountTypeId = useWatch({
    control: form.control,
    name: 'accountTypeId',
  });
  const { accounts } = useLoyaltyAccountTypes({ status: 'active' });

  const changeAccountType = (value: string) => {
    form.setValue('accountTypeId', value, { shouldValidate: true });
    form.setValue('toTier', '');
  };

  return {
    form,
    changeAccountType,
    tiers: activeTiers(
      accounts.find(({ _id }) => _id === accountTypeId)?.tiers,
    ),
  };
};
