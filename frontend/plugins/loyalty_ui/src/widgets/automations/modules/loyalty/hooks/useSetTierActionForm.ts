import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useLoyaltyAccountTypes } from '~/modules/loyalties/settings/account-type/hooks/useLoyaltyAccountTypes';
import { activeTiers } from '~/modules/loyalties/settings/account-type/types';
import {
  setTierActionConfigFormSchema,
  TSetTierActionConfigForm,
} from '../states/setTierActionConfigFormDefinitions';

export const useSetTierActionForm = (
  currentConfig?: Partial<TSetTierActionConfigForm>,
) => {
  const form = useForm<TSetTierActionConfigForm>({
    resolver: zodResolver(setTierActionConfigFormSchema),
    defaultValues: {
      attribution: '',
      accountTypeId: '',
      tier: '',
      ...currentConfig,
    },
  });
  const accountTypeId = useWatch({
    control: form.control,
    name: 'accountTypeId',
  });
  const { accounts } = useLoyaltyAccountTypes({ status: 'active' });

  return {
    form,
    tiers: activeTiers(
      accounts.find(({ _id }) => _id === accountTypeId)?.tiers,
    ),
  };
};
