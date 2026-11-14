import * as dotenv from 'dotenv';
import { AnyBulkWriteOperation, Db, Filter, MongoClient } from 'mongodb';
import { getTargetDbs } from '../../core/commands/_organizationDbs';

dotenv.config();

/**
 * Links each deal to the loyalty entries it caused (`deals.scoreLogIds`), for
 * entries written before sales kept the ids. Only entries whose `targetId` is
 * an existing deal and that sales wrote (`targetType` `sales:sales.deals`, or
 * older ones with `serviceName: 'sales'` and no type). Ids only: no points are
 * copied, and the deal's `updatedAt` stays. Safe to run again (`$addToSet`).
 *
 * Run (DRY_RUN=true counts only, writes nothing):
 *   self-hosted:  MONGO_URL=mongodb://.../erxes npx tsx <this file>
 *   SaaS, one:    MONGO_URL=<core db> TARGET_SUBDOMAIN=<subdomain> npx tsx <this file>
 *   SaaS, all:    MONGO_URL=<core db> ALL_ORGS=true npx tsx <this file>
 *   or: tsx backend/saas-migrations/run-commands.ts --org=<subdomain> linkDealScoreLogs
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
type TDeal = { _id: string; scoreLogIds?: string[] };

const SALES_LOGS: Filter<TScoreLog> = {
  targetId: { $type: 'string', $ne: '' },
  $or: [
    { targetType: 'sales:sales.deals' },
    { serviceName: 'sales', targetType: { $in: [null, ''] } },
  ],
};

type TCounts = { logs: number; linked: number; deals: number; orphans: number };

const flush = async (db: Db, logs: TScoreLog[], counts: TCounts) => {
  if (!logs.length) {
    return;
  }

  const byDeal = new Map<string, string[]>();

  for (const { _id, targetId } of logs) {
    byDeal.set(targetId, [...(byDeal.get(targetId) || []), _id]);
  }

  const deals = await db
    .collection<TDeal>('deals')
    .find(
      { _id: { $in: [...byDeal.keys()] } },
      { projection: { _id: 1, scoreLogIds: 1 } },
    )
    .toArray();
  const found = new Set(deals.map(({ _id }) => _id));

  counts.orphans += logs.filter(({ targetId }) => !found.has(targetId)).length;

  const ops: AnyBulkWriteOperation<TDeal>[] = [];

  for (const { _id, scoreLogIds = [] } of deals) {
    const missing = (byDeal.get(_id) || []).filter(
      (id) => !scoreLogIds.includes(id),
    );

    if (!missing.length) {
      continue;
    }

    counts.linked += missing.length;
    counts.deals += 1;
    ops.push({
      updateOne: {
        filter: { _id },
        update: { $addToSet: { scoreLogIds: { $each: missing } } },
      },
    });
  }

  if (!DRY_RUN && ops.length) {
    await db.collection<TDeal>('deals').bulkWrite(ops, { ordered: false });
  }
};

const linkDb = async (db: Db) => {
  const counts: TCounts = { logs: 0, linked: 0, deals: 0, orphans: 0 };
  // Oldest first, the order sales appends them in.
  const cursor = db
    .collection<TScoreLog>('score_logs')
    .find(SALES_LOGS, { projection: { _id: 1, targetId: 1 } })
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
    `${DRY_RUN ? '[dry run] ' : ''}sales entries: ${counts.logs}, ` +
      `linked: ${counts.linked} on ${counts.deals} deal writes, ` +
      `deal gone: ${counts.orphans}`,
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
