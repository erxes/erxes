import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { IAutomationHistoryAction } from 'ui-modules';
import { useLoyaltyAccountTypes } from '~/modules/loyalties/settings/account-type/hooks/useLoyaltyAccountTypes';

type TEarnCondition =
  | 'minAmount'
  | 'maxAmount'
  | 'firstPurchase'
  | 'sources'
  | 'products';

// Mirrors loyalty_api's `TScoreSkip`: why a campaign moved no points.
type TScoreSkip =
  | { reason: 'no-rows' }
  | { reason: 'no-tier-value'; tier: string }
  | {
      reason: 'conditions-not-met';
      rows: { name: string; unmet: TEarnCondition }[];
    }
  | { reason: 'no-amount'; amountSource: 'paid' | 'total' }
  | { reason: 'rounded-to-zero' }
  | { reason: 'held-past-reset'; availableAt: string; resetsAt: string };

type TSkippedOwner = { ownerId: string; skips: TScoreSkip[] };

type TScoreLog = { _id?: string; ownerId?: string; changeScore?: number };

const NO_TIER = 'none';

const formatAt = (value: string) => format(new Date(value), 'yyyy-MM-dd HH:mm');
const ADJUST_SCORE_ACTION = 'loyalty:score.score.create';

const asArray = <T>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

export const useScoreActionResult = (action: IAutomationHistoryAction) => {
  const { t } = useTranslation('loyalty');
  const { accounts } = useLoyaltyAccountTypes();

  const tierName = (key: string) =>
    key === NO_TIER
      ? t('loyalty-tier-none')
      : accounts
          .flatMap(({ tiers }) => tiers || [])
          .find((tier) => tier.key === key)?.name || key;

  const describe = (skip: TScoreSkip) => {
    switch (skip.reason) {
      case 'no-tier-value':
        return t('score-skip-no-tier-value', { tier: tierName(skip.tier) });
      case 'conditions-not-met':
        return t('score-skip-conditions-not-met', {
          rows: skip.rows
            .map(({ name, unmet }) => `${name}: ${t(`earn-unmet-${unmet}`)}`)
            .join('; '),
        });
      case 'held-past-reset':
        return t('score-skip-held-past-reset', {
          availableAt: formatAt(skip.availableAt),
          resetsAt: formatAt(skip.resetsAt),
        });
      case 'no-amount':
        return t('score-skip-no-amount', {
          amount: t(`score-skip-amount-${skip.amountSource}`),
        });
      default:
        return t(`score-skip-${skip.reason}`);
    }
  };

  // The other loyalty actions share this renderer but not this shape.
  const result =
    action.actionType === ADJUST_SCORE_ACTION ? action.result || {} : {};
  const skippedOwners = asArray<TSkippedOwner>(result.owners);

  return {
    isSkipped: action.status === 'skipped' && skippedOwners.length > 0,
    skippedOwners: skippedOwners.map(({ ownerId, skips }) => ({
      ownerId,
      reasons: skips.map(describe),
    })),
    hasManyOwners: skippedOwners.length > 1,
    logs: asArray<TScoreLog | null>(result.result).filter(
      (log): log is TScoreLog => !!log,
    ),
  };
};
