import * as dotenv from 'dotenv';
import { AnyBulkWriteOperation, Db, Filter, MongoClient } from 'mongodb';
import { getTargetDbs } from '../../core/commands/_organizationDbs';

dotenv.config();

/**
 * Links each POS order to the loyalty entries it caused
 * (`pos_orders.scoreLogIds`), for entries written before sales kept the ids.
 * Only entries whose `targetId` is an existing order and that POS wrote
 * (`targetType` `sales:pos.orders`, or older ones with `serviceName: 'pos'`
 * and no type). Orders a cancel deleted have nothing to link to. Ids only: no
 * points are copied, and the order's `updatedAt` stays. Safe to run again
 * (`$addToSet`).
 *
 * Run (DRY_RUN=true counts only, writes nothing):
 *   self-hosted:  MONGO_URL=mongodb://.../erxes npx tsx <this file>
 *   SaaS, one:    MONGO_URL=<core db> TARGET_SUBDOMAIN=<subdomain> npx tsx <this file>
 *   SaaS, all:    MONGO_URL=<core db> ALL_ORGS=true npx tsx <this file>
 *   or: tsx backend/saas-migrations/run-commands.ts --org=<subdomain> linkPosOrderScoreLogs
 */

const {
  CORE_MONGO_URL,
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true',
} = process.env;

const DRY_RUN = process.env.DRY_RUN === 'true';
const BATCH_SIZE = 1000;

const client = new MongoClient(CORE_MONGO_URL || MONGO_URL);

type TScoreLog = {
  _id: string;
  targetId: string;
  targetType?: string | null;
  serviceName?: string;
};
type TOrder = { _id: string; scoreLogIds?: string[] };

const POS_LOGS: Filter<TScoreLog> = {
  targetId: { $type: 'string', $ne: '' },
  $or: [
    { targetType: 'sales:pos.orders' },
    { serviceName: 'pos', targetType: { $in: [null, ''] } },
  ],
};

type TCounts = { logs: number; linked: number; orders: number; orphans: number };

const flush = async (db: Db, logs: TScoreLog[], counts: TCounts) => {
  if (!logs.length) {
    return;
  }

  const byOrder = new Map<string, string[]>();

  for (const { _id, targetId } of logs) {
    byOrder.set(targetId, [...(byOrder.get(targetId) || []), _id]);
  }

  const orders = await db
    .collection<TOrder>('pos_orders')
    .find(
      { _id: { $in: [...byOrder.keys()] } },
      { projection: { _id: 1, scoreLogIds: 1 } },
    )
    .toArray();
  const found = new Set(orders.map(({ _id }) => _id));

  counts.orphans += logs.filter(({ targetId }) => !found.has(targetId)).length;

  const ops: AnyBulkWriteOperation<TOrder>[] = [];

  for (const { _id, scoreLogIds = [] } of orders) {
    const missing = (byOrder.get(_id) || []).filter(
      (id) => !scoreLogIds.includes(id),
    );

    if (!missing.length) {
      continue;
    }

    counts.linked += missing.length;
    counts.orders += 1;
    ops.push({
      updateOne: {
        filter: { _id },
        update: { $addToSet: { scoreLogIds: { $each: missing } } },
      },
    });
  }

  if (!DRY_RUN && ops.length) {
    await db
      .collection<TOrder>('pos_orders')
      .bulkWrite(ops, { ordered: false });
  }
};

const linkDb = async (db: Db) => {
  const counts: TCounts = { logs: 0, linked: 0, orders: 0, orphans: 0 };
  // Oldest first, the order sales appends them in.
  const cursor = db
    .collection<TScoreLog>('score_logs')
    .find(POS_LOGS, { projection: { _id: 1, targetId: 1 } })
    .sort({ createdAt: 1, _id: 1 });

  let batch: TScoreLog[] = [];

  for await (const log of cursor) {
    counts.logs += 1;
    batch.push(log);

    if (batch.length >= BATCH_SIZE) {
      await flush(db, batch, counts);
      batch = [];
    }
  }

  await flush(db, batch, counts);

  console.log(
    `${DRY_RUN ? '[dry run] ' : ''}POS entries: ${counts.logs}, ` +
      `linked: ${counts.linked} on ${counts.orders} order writes, ` +
      `order gone: ${counts.orphans}`,
  );
};

const command = async () => {
  await client.connect();
  console.log(`Process started at: ${new Date().toISOString()}`);

  const failed: string[] = [];

  for (const { label, db } of await getTargetDbs(client)) {
    console.log(`\n== ${label}`);

    try {
      await linkDb(db);
    } catch (error) {
      console.error(`${label}: ${(error as Error).message}`);
      failed.push(label);
    }
  }

  if (failed.length) {
    console.error(`\nFailed:\n  ${failed.join('\n  ')}`);
  }

  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit(failed.length ? 1 : 0);
};

command().catch(async (error) => {
  console.error(`Migration failed: ${error.message}`, error);
  await client.close();
  process.exit(1);
});
