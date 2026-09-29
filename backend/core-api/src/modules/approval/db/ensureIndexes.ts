import { APPROVAL_REQUEST_KINDS } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

const ACCESS_REQUEST_INDEX = 'lockId_1_requesterId_1';

const reconciled = new Set<string>();
const reconciling = new Map<string, Promise<void>>();

type ExistingIndex = {
  name?: string;
  partialFilterExpression?: Record<string, unknown>;
};

/**
 * The access-request index predates change requests, which carry no lock: with
 * its old filter every change request of one person collided on `lockId: null`.
 * Mongo never rewrites an index's filter in place, so the stale one is dropped
 * and Mongoose recreates it from the schema.
 */
const reconcileApprovalRequestIndexes = async (models: IModels) => {
  const collection = models.ApprovalRequests.collection;
  const indexes: ExistingIndex[] = await collection.indexes();
  const accessIndex = indexes.find(
    (index) => index.name === ACCESS_REQUEST_INDEX,
  );

  if (!accessIndex || accessIndex.partialFilterExpression?.kind) {
    return;
  }

  await collection.dropIndex(ACCESS_REQUEST_INDEX);
  await collection.createIndex(
    { lockId: 1, requesterId: 1 },
    {
      unique: true,
      name: ACCESS_REQUEST_INDEX,
      partialFilterExpression: {
        status: 'pending',
        kind: APPROVAL_REQUEST_KINDS.ACCESS,
      },
    },
  );
};

export const ensureApprovalRequestIndexes = async (
  models: IModels,
  subdomain: string,
): Promise<void> => {
  if (reconciled.has(subdomain)) {
    return;
  }

  const running = reconciling.get(subdomain);

  if (running) {
    return running;
  }

  const run = reconcileApprovalRequestIndexes(models)
    .then(() => {
      reconciled.add(subdomain);
    })
    .catch((e) => {
      console.error('Could not reconcile approval request indexes:', e);
    })
    .finally(() => {
      reconciling.delete(subdomain);
    });

  reconciling.set(subdomain, run);

  return run;
};
