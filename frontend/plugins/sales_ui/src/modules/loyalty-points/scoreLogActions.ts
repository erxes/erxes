export type TScoreLogActionKind =
  | 'earned'
  | 'spent'
  | 'taken-back'
  | 'given-back'
  | 'recalculated'
  | 'expired'
  | 'reset'
  | 'reset-undone';

// In the order the guide lists them: what happens to a deal first comes first.
export const SCORE_LOG_ACTION_KINDS: TScoreLogActionKind[] = [
  'earned',
  'spent',
  'taken-back',
  'given-back',
  'recalculated',
  'expired',
  'reset',
  'reset-undone',
];

/**
 * What a loyalty entry did, as a reader names it: a refund is two things,
 * points taken back (negative) or points given back (positive).
 */
export const scoreLogActionKind = ({
  action,
  change,
  replacedByScoreLogId,
}: {
  action?: string | null;
  change?: number | null;
  replacedByScoreLogId?: string | null;
}): TScoreLogActionKind | null => {
  if (replacedByScoreLogId) {
    return 'recalculated';
  }

  switch (action) {
    case 'add':
      return 'earned';
    case 'subtract':
      return 'spent';
    case 'refund':
      return (change || 0) < 0 ? 'taken-back' : 'given-back';
    case 'expire':
      return 'expired';
    case 'set':
      return 'reset';
    case 'return':
      return 'reset-undone';
    default:
      return null;
  }
};
