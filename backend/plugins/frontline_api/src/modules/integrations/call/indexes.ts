import { Types } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { debugError } from '@/integrations/call/debuggers';

const QUEUE_INDEX = 'wsServer_1_queues_1';

const QUEUE_STATISTICS_INDEX = 'integrationId_1_queue_1';

const LEGACY_PHONE_INDEX = 'phone_1';

const TRUNK_FIELDS = ['srcTrunk', 'dstTrunk'] as const;

const reconciled = new Set<string>();

const reconciling = new Map<string, Promise<void>>();

interface IExistingIndex {
  name?: string;
  unique?: boolean;
  key?: Record<string, unknown>;
  partialFilterExpression?: Record<string, unknown>;
}

const reconcileCallIntegrationIndexes = async (models: IModels) => {
  const collection = models.CallIntegrations.collection;

  const indexes: IExistingIndex[] = await collection.indexes();
  const byName = (name: string) => indexes.find((index) => index.name === name);

  if (byName(LEGACY_PHONE_INDEX)?.unique) {
    await collection.dropIndex(LEGACY_PHONE_INDEX);
  }

  for (const field of TRUNK_FIELDS) {
    const trunkIndex = indexes.find(
      (index) => Object.keys(index.key ?? {}).join() === field,
    );

    if (trunkIndex?.name && trunkIndex.unique) {
      await collection.dropIndex(trunkIndex.name);
    }

    await collection.createIndex({ [field]: 1 }, { name: `${field}_1` });
  }

  const queueIndex = byName(QUEUE_INDEX);

  if (queueIndex && !queueIndex.partialFilterExpression) {
    await collection.dropIndex(QUEUE_INDEX);
  }

  await models.CallIntegrations.updateMany(
    { queues: '' },
    { $pull: { queues: '' } },
  );

  await collection.createIndex(
    { wsServer: 1, queues: 1 },
    {
      unique: true,
      partialFilterExpression: { queues: { $gt: '' } },
      name: QUEUE_INDEX,
    },
  );

  await reconcileQueueStatistics(models);
};

/*
 * `queue` used to be a Number, so a queue can have a numeric and a string
 * row. Keep the newest row per integration and queue, store every queue as a
 * string, then enforce one row each.
 */
const reconcileQueueStatistics = async (models: IModels) => {
  const collection = models.CallQueueStatistics.collection;

  const duplicates = await collection
    .aggregate<{ ids: Types.ObjectId[] }>([
      { $sort: { _id: -1 } },
      {
        $group: {
          _id: {
            integrationId: '$integrationId',
            queue: { $toString: '$queue' },
          },
          ids: { $push: '$_id' },
        },
      },
      { $match: { 'ids.1': { $exists: true } } },
    ])
    .toArray();

  for (const { ids } of duplicates) {
    await collection.deleteMany({ _id: { $in: ids.slice(1) } });
  }

  await collection.updateMany({ queue: { $type: 'number' } }, [
    { $set: { queue: { $toString: '$queue' } } },
  ]);

  await collection.createIndex(
    { integrationId: 1, queue: 1 },
    { unique: true, name: QUEUE_STATISTICS_INDEX },
  );
};

export const ensureCallIndexes = async (
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

  const run = reconcileCallIntegrationIndexes(models)
    .then(() => {
      reconciled.add(subdomain);
    })
    .catch((e) => {
      debugError('Could not reconcile call integration indexes:', e);
    })
    .finally(() => {
      reconciling.delete(subdomain);
    });

  reconciling.set(subdomain, run);

  return run;
};
