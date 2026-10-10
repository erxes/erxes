import { IconX } from '@tabler/icons-react';
import { Button, Form } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TierBandsFields } from '@/deals/loyaltyRules/components/TierBandsFields';
import { TierWalletSelect } from '@/deals/loyaltyRules/components/TierWalletSelect';
import { useLoyaltyTierWallets } from '@/deals/loyaltyRules/hooks/useLoyaltyTierWallets';
import type { PaymentFormData } from './Payment';

// The tier a paid order of this POS sets by its amount; a return keeps it.
export const PosEarnTierField = ({
  control,
}: {
  control: Control<PaymentFormData>;
}) => {
  const { t } = useTranslation('sales');
  const { enabled, tiersOf } = useLoyaltyTierWallets();

  if (!enabled) {
    return null;
  }

  return (
    <Form.Field
      control={control}
      name="earnTier"
      render={({ field }) => {
        const earnTier = field.value;

        return (
          <Form.Item>
            <Form.Label>{t('pos-earn-tier')}</Form.Label>
            <p className="text-xs text-muted-foreground">
              {t('pos-earn-tier-hint')}
            </p>
            <div className="flex max-w-md items-center gap-1">
              <div className="min-w-0 flex-1">
                <TierWalletSelect
                  value={earnTier?.accountTypeId || ''}
                  onChange={(accountTypeId) =>
                    field.onChange({
                      accountTypeId,
                      // Another wallet's tiers have other keys.
                      bands: [],
                      onlyUpgrade: earnTier?.onlyUpgrade ?? true,
                    })
                  }
                />
              </div>
              {earnTier && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => field.onChange(null)}
                  aria-label={t('remove')}
                >
                  <IconX />
                </Button>
              )}
            </div>
            {earnTier && (
              <TierBandsFields
                tiers={tiersOf(earnTier.accountTypeId)}
                value={earnTier}
                onChange={(value) => field.onChange({ ...earnTier, ...value })}
              />
            )}
          </Form.Item>
        );
      }}
    />
  );
};
