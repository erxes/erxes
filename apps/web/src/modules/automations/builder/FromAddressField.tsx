import { useTranslation } from 'react-i18next';
import { FromAddressPicker } from '~/components/FromAddressPicker';
import { useFromAddress } from '~/components/useFromAddress';

/** A step's From address; with no verified domain to pick from, where its emails come from. */
export const FromAddressField = ({
  value,
  onChange,
  disabled,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');

  const from = useFromAddress(typeof value === 'string' ? value : null, (next) =>
    onChange(next ?? undefined),
  );

  if (from.shown) return <FromAddressPicker from={from} disabled={disabled} />;

  if (!from.own) return null;

  return (
    <p className="text-xs text-muted-foreground">
      {t('from-address-none', 'No verified domain to pick from: emails go out from {{address}}.', {
        address: from.own,
      })}
    </p>
  );
};
