import { useQuery } from '@apollo/client';
import { IconTransfer } from '@tabler/icons-react';
import { Button, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { LOYALTY_ACCOUNT_TYPE_LEGACY_FIELD_COUNT } from '../graphql/loyaltyAccountTypeQueries';
import { useLoyaltyAccountTypesAdoptCampaignFields } from '../hooks/useLoyaltyAccountTypeMutations';

// Campaigns created before account types write to plain custom fields; this
// turns those fields into account types in place.
export const LoyaltyAccountTypeLegacyBanner = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();
  const { data } = useQuery<{ loyaltyAccountTypeLegacyFieldCount: number }>(
    LOYALTY_ACCOUNT_TYPE_LEGACY_FIELD_COUNT,
  );
  const { run: adopt, loading } = useLoyaltyAccountTypesAdoptCampaignFields();
  const count = data?.loyaltyAccountTypeLegacyFieldCount || 0;

  if (!count) {
    return null;
  }

  const onAdopt = () =>
    adopt({}, (result) => {
      const skipped =
        result?.loyaltyAccountTypesAdoptCampaignFields.skipped || [];

      if (skipped.length) {
        toast({
          title: t('loyalty-account-types-adopt-skipped', {
            count: skipped.length,
          }),
          description: skipped.map(({ reason }) => reason).join('; '),
          variant: 'destructive',
        });
      }
    });

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 m-3 mb-0">
      <p className="text-sm">
        {t('loyalty-account-types-legacy-fields', { count })}
      </p>
      <Button variant="secondary" disabled={loading} onClick={onAdopt}>
        <IconTransfer />
        {t('loyalty-account-types-adopt')}
      </Button>
    </div>
  );
};
