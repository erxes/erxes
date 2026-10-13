import { IconStairs } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useLoyaltyAccountTypes } from '~/modules/loyalties/settings/account-type/hooks/useLoyaltyAccountTypes';
import { TSetTierActionConfigForm } from '../../../states/setTierActionConfigFormDefinitions';

export const SetTierNodeContent = ({
  config,
}: {
  config?: Partial<TSetTierActionConfigForm>;
}) => {
  const { t } = useTranslation('loyalty');
  const { accounts } = useLoyaltyAccountTypes();
  const accountType = accounts.find(({ _id }) => _id === config?.accountTypeId);
  // With amount bands the tier is the purchase's to decide.
  const tierName = config?.bands?.length
    ? t('set-tier-mode-amount')
    : config?.tier
    ? accountType?.tiers?.find(({ key }) => key === config.tier)?.name
    : t('loyalty-tier-none');

  return (
    <div className="flex items-center gap-2 text-sm text-accent-foreground">
      <span className="flex size-5 items-center justify-center rounded bg-muted text-foreground">
        <IconStairs className="size-3.5" />
      </span>
      <span>
        {accountType
          ? t('set-tier-node', {
              accountType: accountType.name,
              tier: tierName,
            })
          : t('no-account-type-selected')}
      </span>
    </div>
  );
};
