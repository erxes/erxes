import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import { Control, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LOYALTY_ACCOUNT_TYPE_PERIOD_PREVIEW } from '../graphql/loyaltyAccountTypeQueries';
import { TLoyaltyAccountTypeFormValues } from './useLoyaltyAccountTypeForm';

type TPeriodPreview = {
  timeZone: string;
  nextReset?: string | null;
  noEarnFrom?: string | null;
  earnedNowExpiresAt?: string | null;
  pendingUntil?: string | null;
  tierTo?: 'keep' | 'none' | 'lowest' | null;
  impact?: {
    accounts: number;
    total: number;
    sampled: boolean;
    pointsCleared: number;
    pointsKept: number;
    tierChanges: {
      from?: string | null;
      to?: string | null;
      accounts: number;
    }[];
  } | null;
};

const formatAt = (value?: string | null) =>
  value ? format(new Date(value), 'yyyy-MM-dd HH:mm') : '';

/**
 * The form's time settings in dates, and what the next reset would do to the
 * accounts holding this wallet; recomputed on the server as settings change.
 */
export const useLoyaltyAccountTypePeriodPreview = ({
  control,
  accountTypeId,
}: {
  control: Control<TLoyaltyAccountTypeFormValues>;
  accountTypeId?: string;
}) => {
  const { t } = useTranslation('loyalty');
  const [expiry, reset, pendingDays, tiers] = useWatch({
    control,
    name: ['expiry', 'reset', 'pendingDays', 'tiers'],
  });
  const months = Number(expiry?.months) || undefined;

  const { data, loading, error } = useQuery<{
    loyaltyAccountTypePeriodPreview: TPeriodPreview;
  }>(LOYALTY_ACCOUNT_TYPE_PERIOD_PREVIEW, {
    variables: {
      _id: accountTypeId,
      expiry: { mode: expiry?.mode || 'none', months },
      reset: { period: reset?.period || 'never', tierTo: reset?.tierTo },
      pendingDays: Number(pendingDays) || 0,
    },
    // Rolling expiry is previewed only once it has a number of months.
    skip: expiry?.mode === 'rolling' && !months,
    fetchPolicy: 'cache-and-network',
  });

  const preview = data?.loyaltyAccountTypePeriodPreview;
  const tierName = (key?: string | null) =>
    key
      ? tiers?.find((tier) => tier.key === key)?.name || key
      : t('loyalty-tier-none');

  const expiryLine = !preview
    ? ''
    : preview.earnedNowExpiresAt
    ? t('period-preview-expires-at', {
        at: formatAt(preview.earnedNowExpiresAt),
      })
    : t('period-preview-never-expires');

  const tierLine =
    !preview?.nextReset || !preview.tierTo || !tiers?.length
      ? ''
      : preview.tierTo === 'keep'
      ? t('period-preview-tier-keep')
      : t('period-preview-tier-to', {
          at: formatAt(preview.nextReset),
          tier:
            preview.tierTo === 'lowest'
              ? tiers[0]?.name || ''
              : t('loyalty-tier-none'),
        });

  return {
    loading: loading && !preview,
    error: !preview ? error : undefined,
    timeZone: preview?.timeZone,
    expiryLine,
    pendingLine: preview?.pendingUntil
      ? t('period-preview-pending-until', {
          at: formatAt(preview.pendingUntil),
        })
      : '',
    nextResetLine: preview?.nextReset
      ? t('period-preview-next-reset', {
          at: formatAt(preview.nextReset),
          timeZone: preview.timeZone,
        })
      : '',
    tierLine,
    noEarnLine: preview?.noEarnFrom
      ? t('period-preview-no-earn', {
          from: formatAt(preview.noEarnFrom),
          at: formatAt(preview.nextReset),
        })
      : '',
    impact: preview?.impact
      ? {
          ...preview.impact,
          tierChanges: preview.impact.tierChanges.map(
            ({ from, to, accounts }) =>
              t('period-preview-tier-change', {
                from: tierName(from),
                to: tierName(to),
                count: accounts,
              }),
          ),
        }
      : null,
  };
};
