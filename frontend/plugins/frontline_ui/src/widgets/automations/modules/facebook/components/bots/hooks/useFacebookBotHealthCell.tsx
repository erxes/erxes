import { IFacebookBotHealth } from '@/integrations/facebook/types/FacebookBot';

const BOT_STATUS_LABELS = {
  healthy: 'Healthy',
  degraded: 'Needs repair',
  broken: 'Broken',
  syncing: 'Syncing',
  unknown: 'Unknown',
} as const;

const BOT_STATUS_VARIANTS = {
  healthy: 'success',
  degraded: 'destructive',
  broken: 'destructive',
  syncing: 'secondary',
  unknown: 'secondary',
} as const;

export const useFacebookBotHealthCell = (health?: IFacebookBotHealth) => {
  const status = health?.status || 'unknown';
  const statusLabel =
    BOT_STATUS_LABELS[status as keyof typeof BOT_STATUS_LABELS] ||
    BOT_STATUS_LABELS.unknown;
  const statusVariant =
    BOT_STATUS_VARIANTS[status as keyof typeof BOT_STATUS_VARIANTS] ||
    BOT_STATUS_VARIANTS.unknown;
  const hasSubscriptionIssue = health?.isSubscribed === false;
  const hasProfileIssue = health?.isProfileSynced === false;
  const lastError = health?.lastError || '';
  const detailItems = [
    { label: 'Status', value: statusLabel },
    {
      label: 'Subscription',
      value: hasSubscriptionIssue ? 'Missing' : 'OK',
    },
    {
      label: 'Profile sync',
      value: hasProfileIssue ? 'Out of sync' : 'OK',
    },
    ...(lastError ? [{ label: 'Message', value: lastError }] : []),
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
