import * as dotenv from 'dotenv';
import { Db, MongoClient } from 'mongodb';
import { getTargetDbs } from '../../core/commands/_organizationDbs';

dotenv.config();

/**
 * Moves "pay with points" from score campaigns to loyalty wallets. A pipeline
 * or POS payment row with `scoreCampaignId` gets the campaign's wallet as
 * `accountTypeId` (the campaign field is dropped; the row keeps its `type`,
 * which accounting and ebarimt know it by). Then every deal line
 * (`paymentsData.<type>`) and POS order line (`paidAmounts[]`) of that row is
 * stamped with the wallet it paid from. Reads loyalty's `score_campaigns`
 * (`accountTypeId` only). A campaign without a wallet is reported and its
 * row left as it is. Safe to run again: stamped lines and moved rows are
 * skipped.
 *
 * Run (DRY_RUN=true counts only, writes nothing):
 *   self-hosted:  MONGO_URL=mongodb://.../erxes npx tsx <this file>
 *   SaaS, one:    MONGO_URL=<core db> TARGET_SUBDOMAIN=<subdomain> npx tsx <this file>
 *   SaaS, all:    MONGO_URL=<core db> ALL_ORGS=true npx tsx <this file>
 *   or: tsx backend/saas-migrations/run-commands.ts --org=<subdomain> migrateLoyaltyPayments
 */

const {
  CORE_MONGO_URL,
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true',
} = process.env;

const DRY_RUN = process.env.DRY_RUN === 'true';

const client = new MongoClient(CORE_MONGO_URL || MONGO_URL);

type TPaymentRow = {
  type?: string;
  scoreCampaignId?: string;
  accountTypeId?: string;
  [key: string]: unknown;
};

type TPaymentOwner = {
  _id: string;
  name?: string;
  token?: string;
  paymentTypes?: TPaymentRow[];
};

type TCounts = {
  rows: number;
  deals: number;
  orders: number;
  unresolved: string[];
};

// type → wallet for the rows moved, and the rows as they are saved.
const moveRows = (
  owner: TPaymentOwner,
  walletOf: Map<string, string>,
  label: string,
  counts: TCounts,
) => {
  const wallets = new Map<string, string>();

  const paymentTypes = (owner.paymentTypes || []).map((row) => {
    if (!row.scoreCampaignId) {
      return row;
    }

    const accountTypeId = walletOf.get(row.scoreCampaignId);

    if (!accountTypeId || !row.type) {
      counts.unresolved.push(
        `${label} ${owner.name || owner._id}: "${row.type}" → campaign ${
          row.scoreCampaignId
        } has no wallet`,
      );

      return row;
    }

    const { scoreCampaignId: _campaign, ...rest } = row;

    wallets.set(row.type, accountTypeId);
    counts.rows += 1;

    return { ...rest, accountTypeId };
  });

  return { wallets, paymentTypes };
};

const stampDeals = async (
  db: Db,
  pipelineId: string,
  wallets: Map<string, string>,
  counts: TCounts,
) => {
  const stageIds = (
    await db
      .collection<{ _id: string }>('sales_stages')
      .find({ pipelineId }, { projection: { _id: 1 } })
      .toArray()
  ).map(({ _id }) => _id);

  if (!stageIds.length) {
    return;
  }

  for (const [type, accountTypeId] of wallets) {
    const filter = {
      stageId: { $in: stageIds },
      [`paymentsData.${type}`]: { $exists: true },
      [`paymentsData.${type}.accountTypeId`]: { $exists: false },
    };

    if (DRY_RUN) {
      counts.deals += await db.collection('deals').countDocuments(filter);
      continue;
    }

    const { modifiedCount } = await db
      .collection('deals')
      .updateMany(filter, {
        $set: { [`paymentsData.${type}.accountTypeId`]: accountTypeId },
      });

    counts.deals += modifiedCount;
  }
};

const stampOrders = async (
  db: Db,
  posToken: string,
  wallets: Map<string, string>,
  counts: TCounts,
) => {
  for (const [type, accountTypeId] of wallets) {
    const filter = {
      posToken,
      paidAmounts: {
        $elemMatch: { type, accountTypeId: { $exists: false } },
      },
    };

    if (DRY_RUN) {
      counts.orders += await db.collection('pos_orders').countDocuments(filter);
      continue;
    }

    const { modifiedCount } = await db.collection('pos_orders').updateMany(
      filter,
      { $set: { 'paidAmounts.$[line].accountTypeId': accountTypeId } },
      {
        arrayFilters: [
          { 'line.type': type, 'line.accountTypeId': { $exists: false } },
        ],
      },
    );

    counts.orders += modifiedCount;
  }
};

const migrateDb = async (db: Db) => {
  const counts: TCounts = { rows: 0, deals: 0, orders: 0, unresolved: [] };
  const walletOf = new Map(
    (
      await db
        .collection<{ _id: string; accountTypeId?: string }>('score_campaigns')
        .find(
          { accountTypeId: { $type: 'string', $ne: '' } },
          { projection: { accountTypeId: 1 } },
        )
        .toArray()
    )
      .filter(({ accountTypeId }) => accountTypeId)
      .map(({ _id, accountTypeId }) => [String(_id), String(accountTypeId)]),
  );
  const withCampaigns = { 'paymentTypes.scoreCampaignId': { $exists: true } };

  for await (const pipeline of db
    .collection<TPaymentOwner>('sales_pipelines')
    .find(withCampaigns, { projection: { name: 1, paymentTypes: 1 } })) {
    const { wallets, paymentTypes } = moveRows(
      pipeline,
      walletOf,
      'pipeline',
      counts,
    );

    if (!wallets.size) {
      continue;
    }

    await stampDeals(db, pipeline._id, wallets, counts);

    if (!DRY_RUN) {
      await db
        .collection<TPaymentOwner>('sales_pipelines')
        .updateOne({ _id: pipeline._id }, { $set: { paymentTypes } });
    }
  }

  for await (const pos of db
    .collection<TPaymentOwner>('pos')
    .find(withCampaigns, {
      projection: { name: 1, token: 1, paymentTypes: 1 },
    })) {
    const { wallets, paymentTypes } = moveRows(pos, walletOf, 'POS', counts);

    if (!wallets.size) {
      continue;
    }

    if (pos.token) {
      await stampOrders(db, pos.token, wallets, counts);
    }

    if (!DRY_RUN) {
      await db
        .collection<TPaymentOwner>('pos')
        .updateOne({ _id: pos._id }, { $set: { paymentTypes } });
    }
  }

  console.log(
    `${DRY_RUN ? '[dry run] ' : ''}rows moved: ${counts.rows}, ` +
      `deals stamped: ${counts.deals}, orders stamped: ${counts.orders}`,
  );

  if (counts.unresolved.length) {
    console.log('Left as they are (give the campaign a wallet, run again):');
    counts.unresolved.forEach((line) => console.log(`  ${line}`));
  }
};

const command = async () => {
  await client.connect();
  console.log(`Process started at: ${new Date().toISOString()}`);

  const failed: string[] = [];

  for (const { label, db } of await getTargetDbs(client)) {
    console.log(`\n== ${label}`);

    try {
      await migrateDb(db);
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
