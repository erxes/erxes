import { IconMedal, IconX } from '@tabler/icons-react';
import { Button, Form } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  POS_VALUE_OFFSET_CLASS_NAME,
  PosPanelRow,
} from '@/pos/components/pos-edit/PosFieldRow';
import { TierBandsFields } from '@/deals/loyaltyRules/components/TierBandsFields';
import { TierWalletSelect } from '@/deals/loyaltyRules/components/TierWalletSelect';
import { useLoyaltyTierWallets } from '@/deals/loyaltyRules/hooks/useLoyaltyTierWallets';
import type { PaymentFormData } from './Payment';

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
          <Form.Item className="space-y-1">
            <PosPanelRow label={t('pos-earn-tier')} icon={IconMedal}>
              <div className="flex items-center gap-1">
                <div className="min-w-0 flex-1">
                  <TierWalletSelect
                    value={earnTier?.accountTypeId || ''}
                    onChange={(accountTypeId) =>
                      field.onChange({
                        accountTypeId,
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
                    className="size-7"
                    onClick={() => field.onChange(null)}
                    aria-label={t('remove')}
                  >
                    <IconX />
                  </Button>
                )}
              </div>
            </PosPanelRow>
            <p
              className={`${POS_VALUE_OFFSET_CLASS_NAME} text-xs text-muted-foreground`}
            >
              {t('pos-earn-tier-hint')}
            </p>
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
