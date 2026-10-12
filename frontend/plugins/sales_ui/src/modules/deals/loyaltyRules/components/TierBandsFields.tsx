import { IconAlertTriangle } from '@tabler/icons-react';
import { Checkbox, Input, Label } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  setTierBand,
  tierBandRows,
  tierBandsIssue,
  TLoyaltyTier,
  TTierBandsValue,
} from '../tierBands';

/**
 * Which tier a purchase amount sets: a range per tier, and whether a smaller
 * purchase may lower a tier.
 */
export const TierBandsFields = ({
  tiers,
  value,
  onChange,
}: {
  tiers: TLoyaltyTier[];
  value: TTierBandsValue;
  onChange: (value: TTierBandsValue) => void;
}) => {
  const { t } = useTranslation('sales');
  const rows = tierBandRows(tiers, value.bands);
  const issue = tierBandsIssue(value.bands);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid max-w-md grid-cols-[minmax(5rem,8rem)_1fr_1fr] items-center gap-x-2 gap-y-1.5">
        <Label className="text-xs">{t('loyalty-tier-bands-tier')}</Label>
        <span className="text-xs text-muted-foreground">
          {t('loyalty-tier-bands-from')}
        </span>
        <span className="text-xs text-muted-foreground">
          {t('loyalty-tier-bands-to')}
        </span>
        {rows.map(({ key, name, band }) => (
          <div key={key} className="contents">
            <span className="truncate text-sm font-medium">{name}</span>
            <Input.Number
              value={band?.min}
              placeholder="0"
              onChange={(amount) =>
                onChange({
                  ...value,
                  bands: setTierBand(value.bands, key, 'min', amount),
                })
              }
            />
            <Input.Number
              value={band?.max}
              placeholder={t('loyalty-tier-bands-no-limit')}
              onChange={(amount) =>
                onChange({
                  ...value,
                  bands: setTierBand(value.bands, key, 'max', amount),
                })
              }
            />
          </div>
        ))}
      </div>
      {issue && (
        <p className="flex items-center gap-1.5 text-xs text-warning">
          <IconAlertTriangle className="size-3.5 shrink-0" />
          {t(`loyalty-tier-bands-${issue}`)}
        </p>
      )}
      <label className="flex items-start gap-2 text-sm">
        <Checkbox
          className="mt-0.5"
          checked={value.onlyUpgrade}
          onCheckedChange={(checked) =>
            onChange({ ...value, onlyUpgrade: checked === true })
          }
        />
        {t('loyalty-tier-only-upgrade')}
      </label>
    </div>
  );
};
