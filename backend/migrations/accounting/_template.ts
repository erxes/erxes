/**
 * TEMPLATE — accounting migration.
 *
 * This file is IGNORED by the runner (name starts with `_`). To create a real
 * migration:
 *   1. Copy it to a descriptive name, e.g. `migrateTransactionsAddFoo.ts`.
 *   2. Fill in the COLLECTION and the transformation marked with TODO.
 *   3. Run it:  tsx backend/migrations/run.ts accounting/migrateTransactionsAddFoo.ts
 *
 * Accounting collections you might target:
 *   transactions, accounts, account_categories, configs, ctax_rows, vat_rows,
 *   adjust_inventories, safe_remainders, safe_remainder_items, reserve_rems
 *
 * Follows the standalone pattern used by the other migrations: own dotenv, own
 * Mongo connection, self-invoking, exits when done.
 */
import * as dotenv from 'dotenv';

dotenv.config();

import { AnyBulkWriteOperation, Collection, Db, MongoClient } from 'mongodb';

const { MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true' } =
  process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

// Set to false (or pass APPLY=1) once you're ready to write to the database.
// Until then the migration runs read-only and only reports what it would change.
const DRY_RUN = process.env.APPLY !== '1';

const client = new MongoClient(MONGO_URL);

let db: Db;
let collection: Collection;

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  // TODO: pick the collection to migrate.
  collection = db.collection('transactions');

  try {
    // TODO: describe which documents need migrating.
    const filter = {
      // e.g. { newField: { $exists: false } }
    };

    const count = await collection.countDocuments(filter);
    console.log(
      `Found ${count} document(s) to migrate in '${collection.collectionName}'.`,
    );

    if (DRY_RUN) {
      console.log(
        'DRY RUN — no changes written. Re-run with APPLY=1 to apply.',
      );
      await client.close();
      process.exit();
    }

    // ----- Option A: a single uniform update for every matched document -----
    // TODO: replace with your update, or delete this block and use Option B.
    await collection.updateMany(filter, {
      // $set: { newField: defaultValue },
      // $unset: { oldField: '' },
      // $rename: { from: 'to' },
    });

    // ----- Option B: per-document transform (use when each doc differs) -----
    // const ops: AnyBulkWriteOperation[] = [];
    // const cursor = collection.find(filter);
    // for await (const doc of cursor) {
    //   ops.push({
    //     updateOne: {
    //       filter: { _id: doc._id },
    //       update: { $set: { /* derived from doc */ } },
    //     },
    //   });
    //   if (ops.length >= 1000) {
    //     await collection.bulkWrite(ops);
    //     ops.length = 0;
    //   }
    // }
    // if (ops.length) await collection.bulkWrite(ops);
  } catch (e) {
    console.log(`Error occurred: ${e.message}`);
  }

  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command();
