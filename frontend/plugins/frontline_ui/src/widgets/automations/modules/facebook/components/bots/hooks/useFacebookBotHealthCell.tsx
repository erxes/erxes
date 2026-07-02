import { useTranslation } from 'react-i18next';
import { IFacebookBotHealth } from '@/integrations/facebook/types/FacebookBot';

const BOT_STATUS_LABELS = {
  healthy: 'healthy',
  degraded: 'needs-repair',
  broken: 'broken',
  syncing: 'syncing',
  unknown: 'unknown',
} as const;

const BOT_STATUS_VARIANTS = {
  healthy: 'success',
  degraded: 'destructive',
  broken: 'destructive',
  syncing: 'secondary',
  unknown: 'secondary',
} as const;

export const useFacebookBotHealthCell = (health?: IFacebookBotHealth) => {
  const { t } = useTranslation('frontline');
  const status = health?.status || 'unknown';
  const statusLabel = t(
    BOT_STATUS_LABELS[status as keyof typeof BOT_STATUS_LABELS] ||
    BOT_STATUS_LABELS.unknown
  );
  const statusVariant =
    BOT_STATUS_VARIANTS[status as keyof typeof BOT_STATUS_VARIANTS] ||
    BOT_STATUS_VARIANTS.unknown;
  const hasSubscriptionIssue = health?.isSubscribed === false;
  const hasProfileIssue = health?.isProfileSynced === false;
  const lastError = health?.lastError || '';
  const detailItems = [
    { label: t('status'), value: statusLabel },
    {
      label: t('subscription'),
      value: hasSubscriptionIssue ? t('missing-label') : t('ok'),
    },
    {
      label: t('profile-sync'),
      value: hasProfileIssue ? t('out-of-sync') : t('ok'),
    },
    ...(lastError ? [{ label: t('message'), value: lastError }] : []),
  ];

  return {
    statusLabel,
    statusVariant,
    hasSubscriptionIssue,
    hasProfileIssue,
    lastError,
    showDetails: !!lastError || hasSubscriptionIssue || hasProfileIssue,
    detailItems,
  };
};
