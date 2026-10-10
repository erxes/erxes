import { Form, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useLoyaltyTierWallets } from '../hooks/useLoyaltyTierWallets';

/** A customer wallet with tiers; changing it starts the bands over. */
export const TierWalletSelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (accountTypeId: string) => void;
}) => {
  const { t } = useTranslation('sales');
  const { wallets, loading } = useLoyaltyTierWallets();

  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <Form.Control>
        <Select.Trigger disabled={loading}>
          <Select.Value placeholder={t('loyalty-tier-choose-wallet')} />
        </Select.Trigger>
      </Form.Control>
      <Select.Content>
        {wallets.map(({ _id, name }) => (
          <Select.Item key={_id} value={_id}>
            {name}
          </Select.Item>
        ))}
        {!loading && !wallets.length && (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">
            {t('loyalty-tier-no-wallets')}
          </p>
        )}
      </Select.Content>
    </Select>
  );
};
