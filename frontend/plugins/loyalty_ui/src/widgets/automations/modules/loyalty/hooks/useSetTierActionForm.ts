import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useLoyaltyAccountTypes } from '~/modules/loyalties/settings/account-type/hooks/useLoyaltyAccountTypes';
import { TTierBandsValue } from '~/modules/loyalties/settings/account-type/tierBands';
import { activeTiers } from '~/modules/loyalties/settings/account-type/types';
import {
  setTierActionConfigFormSchema,
  TSetTierActionConfigForm,
} from '../states/setTierActionConfigFormDefinitions';

// Only the chosen mode's fields are kept, so the backend never sees both.
export const toSetTierConfig = (
  values: TSetTierActionConfigForm,
): TSetTierActionConfigForm =>
  values.mode === 'amount'
    ? { ...values, tier: '', keepHigherTier: undefined }
    : { ...values, bands: [] };

export const useSetTierActionForm = (
  currentConfig?: Partial<TSetTierActionConfigForm>,
) => {
  const form = useForm<TSetTierActionConfigForm>({
    resolver: zodResolver(setTierActionConfigFormSchema),
    defaultValues: {
      attribution: '',
      accountTypeId: '',
      tier: '',
      bands: [],
      onlyUpgrade: true,
      ...currentConfig,
      // Older steps carry no mode: they set a fixed tier.
      mode: currentConfig?.bands?.length ? 'amount' : 'fixed',
    },
  });
  const [accountTypeId, mode, bands, onlyUpgrade] = useWatch({
    control: form.control,
    name: ['accountTypeId', 'mode', 'bands', 'onlyUpgrade'],
  });
  const setBandsValue = (value: TTierBandsValue) => {
    form.setValue('bands', value.bands, { shouldValidate: true });
    form.setValue('onlyUpgrade', value.onlyUpgrade);
  };
  const { accounts } = useLoyaltyAccountTypes({ status: 'active' });

  return {
    form,
    mode,
    bandsValue: { bands, onlyUpgrade },
    setBandsValue,
    tiers: activeTiers(
      accounts.find(({ _id }) => _id === accountTypeId)?.tiers,
    ),
  };
};
