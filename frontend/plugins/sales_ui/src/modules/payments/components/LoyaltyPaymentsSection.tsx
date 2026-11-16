import { Label, MultipleSelector, Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type TLoyaltyPayments = {
  enabled: boolean;
  on: boolean;
  setOn: (on: boolean) => void;
  walletIds: string[];
  setWallets: (ids: string[]) => void;
  wallets: { _id: string; name: string }[];
  loading: boolean;
};

/** Paying with points: which loyalty wallets customers may pay from. */
export const LoyaltyPaymentsSection = ({
  loyalty,
}: {
  loyalty: TLoyaltyPayments;
}) => {
  const { t } = useTranslation('sales');
  const { enabled, on, setOn, walletIds, setWallets, wallets, loading } =
    loyalty;

  if (!enabled) {
    return null;
  }

  const options = wallets.map(({ _id, name }) => ({ value: _id, label: name }));

  return (
    <div className="flex flex-col gap-3 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="loyalty-payment-on" className="text-sm font-medium">
            {t('loyalty-payment')}
          </Label>
          <p className="text-xs text-muted-foreground">
            {t('loyalty-payment-hint')}
          </p>
        </div>
        <Switch
          id="loyalty-payment-on"
          checked={on}
          onCheckedChange={setOn}
        />
      </div>
      {on && (
        <MultipleSelector
          value={walletIds.map((id) => ({
            value: id,
            label:
              wallets.find(({ _id }) => _id === id)?.name ||
              t(loading ? 'loading' : 'loyalty-payment-wallet-gone'),
          }))}
          options={options}
          placeholder={t('loyalty-payment-choose-wallets')}
          hidePlaceholderWhenSelected
          disabled={loading}
          emptyIndicator={
            <p className="text-center text-sm text-muted-foreground">
              {t('loyalty-payment-no-wallets')}
            </p>
          }
          onChange={(selected) => setWallets(selected.map(({ value }) => value))}
        />
      )}
    </div>
  );
};
