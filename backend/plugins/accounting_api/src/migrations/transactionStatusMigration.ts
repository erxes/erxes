import type { Collection, Document, Filter } from 'mongodb';

export const TRANSACTIONS_COLLECTION = 'accountings_transactions';

/** Statuses the new workflow keeps as they are. */
const KEPT_STATUSES = [
  'estimated',
  'complete',
  'executing',
  'requested',
  'draft',
  'mentioned',
  'plan',
];

const hasRecipients = {
  'mentionUserIds.0': { $exists: true, $nin: [null, ''] },
};

type TStatusMigrationStep = {
  name: string;
  filter: Filter<Document>;
  status: string;
};

/**
 * Old statuses mapped to their equivalent in the new tiers, in order.
 *
 * - The old business tier (`progress`, `assigned`, `confirmed`, `canelled`)
 *   counted as real; it becomes `estimated`, real but not yet complete, so
 *   ledgers and balances keep these rows.
 * - `approved`, `rejeced` and `returned` were actions on a request. A row in
 *   one of them goes back to the step before the action: the addressed draft
 *   (`mentioned`) when it still names recipients, otherwise the owner's
 *   `draft`.
 * - A `mentioned` row without recipients cannot be saved under the new rules,
 *   so it becomes `draft`.
 */
export const TRANSACTION_STATUS_MIGRATION_STEPS: TStatusMigrationStep[] = [
  {
    // The spec spelled the final status `completed`; the value is `complete`.
    name: 'completed-to-complete',
    filter: { status: 'completed' },
    status: 'complete',
  },
  {
    name: 'business-to-estimated',
    filter: {
      status: { $in: ['progress', 'assigned', 'confirmed', 'canelled'] },
    },
    status: 'estimated',
  },
  {
    name: 'actions-to-mentioned',
    filter: {
      status: { $in: ['approved', 'rejeced', 'returned'] },
      ...hasRecipients,
    },
    status: 'mentioned',
  },
  {
    name: 'actions-to-draft',
    filter: {
      status: { $in: ['approved', 'rejeced', 'returned'] },
      $nor: [hasRecipients],
    },
    status: 'draft',
  },
  {
    name: 'unaddressed-mentioned-to-draft',
    filter: { status: 'mentioned', $nor: [hasRecipients] },
    status: 'draft',
  },
];

/** Rows left untouched because their status is unknown to both workflows. */
export const UNKNOWN_STATUS_FILTER: Filter<Document> = {
  status: {
    $nin: [
      ...KEPT_STATUSES,
      'completed',
      'progress',
      'assigned',
      'confirmed',
      'canelled',
      'approved',
      'rejeced',
      'returned',
    ],
  },
};

export type TTransactionStatusMigrationResult = {
  steps: Record<string, number>;
  unknown: number;
};

/**
 * Migrates one tenant database. Step filters do not overlap, so a row moves
 * once and a dry run's counts match the real run. Running it again is a
 * no-op.
 */
export const migrateTransactionStatuses = async (
  transactions: Collection<Document>,
  { dryRun = false }: { dryRun?: boolean } = {},
): Promise<TTransactionStatusMigrationResult> => {
  const steps: Record<string, number> = {};

  for (const step of TRANSACTION_STATUS_MIGRATION_STEPS) {
    steps[step.name] = dryRun
      ? await transactions.countDocuments(step.filter)
      : (
          await transactions.updateMany(step.filter, {
            $set: { status: step.status },
          })
        ).modifiedCount;
  }

  return {
    steps,
    unknown: await transactions.countDocuments(UNKNOWN_STATUS_FILTER),
  };
};
