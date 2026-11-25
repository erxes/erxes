import { IconAlertTriangle, IconWallet } from '@tabler/icons-react';
import { Alert, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { usePapaWallet } from '../hooks/usePapaWallet';
import { isPapaWalletShort } from '../utils/papaJson';

const formatMoney = (value: number) => `${value.toLocaleString()}₮`;

interface PapaWalletBalanceProps {
  /** A delivery fee to compare with; a shortfall shows a top-up warning. */
  amount?: unknown;
}

/** One line with the Papa wallet balance, warning when it cannot pay `amount`. */
export const PapaWalletBalance = ({ amount }: PapaWalletBalanceProps) => {
  const { t } = useTranslation('sales');
  const { wallet, loading, error } = usePapaWallet();

  if (loading && !wallet) {
    return <Spinner size="sm" />;
  }

  if (error || !wallet) {
    return (
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <IconWallet className="size-4" />
        {t('papa-wallet-unavailable', 'Papa wallet balance is unavailable')}
        {error ? `: ${error.message}` : ''}
      </p>
    );
  }

  const short = isPapaWalletShort(wallet, amount);

  return (
    <div className="space-y-2">
      <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <IconWallet className="size-4" />
        {t('papa-wallet-balance', 'Papa wallet')}:{' '}
        <span className="font-medium tabular-nums text-foreground">
          {formatMoney(wallet.available)}
        </span>
        {wallet.hold > 0 &&
          ` (${t('papa-wallet-hold', 'on hold')} ${formatMoney(wallet.hold)})`}
        {wallet.code ? ` · ${wallet.code}` : ''}
      </p>
      {short && (
        <Alert variant="warning">
          <IconAlertTriangle />
          <Alert.Description>
            {t(
              'papa-wallet-short',
              'The Papa wallet cannot pay this delivery. Papa takes the fee when the delivery ends, so top up the wallet in the Papa Business app or business.papa.mn first, or the delivery will stay unpaid.',
            )}
          </Alert.Description>
        </Alert>
      )}
    </div>
  );
};
