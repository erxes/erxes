import { Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { activeTiers } from '../../settings/account-type/types';
import { useLoyaltyAccountSetTier } from '../hooks/useLoyaltyAccountSetTier';
import { ILoyaltyAccountBalance } from '../types';

// Select items cannot hold an empty value.
const NO_TIER = '__none';

export const LoyaltyAccountTierSelect = ({
  accountId,
  balance: { accountTypeId, accountType, tier },
  disabled,
}: {
  accountId: string;
  balance: ILoyaltyAccountBalance;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('loyalty');
  const { setTier, loading } = useLoyaltyAccountSetTier();
  const tiers = activeTiers(accountType?.tiers);

  if (!tiers.length && !tier) {
    return null;
  }

  return (
    <Select
      value={tier?.key || NO_TIER}
      disabled={disabled || loading || accountType?.status !== 'active'}
      onValueChange={(value) =>
        setTier({
          accountId,
          accountTypeId,
          tier: value === NO_TIER ? null : value,
        })
      }
    >
      <Select.Trigger className="h-6 w-auto min-w-24 text-xs">
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value={NO_TIER}>{t('loyalty-tier-none')}</Select.Item>
        {tiers.map(({ key, name }) => (
          <Select.Item key={key} value={key}>
            {name}
          </Select.Item>
        ))}
        {tier?.deprecated && (
          <Select.Item value={tier.key} disabled>
            {tier.name}
          </Select.Item>
        )}
      </Select.Content>
    </Select>
  );
};
