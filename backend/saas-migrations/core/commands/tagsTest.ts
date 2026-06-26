import * as dotenv from 'dotenv';

dotenv.config();

import { MongoClient } from 'mongodb';

const {
  MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true',
  CORE_MONGO_URL,
  SOURCE_SUBDOMAIN,
  TARGET_SUBDOMAIN,
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

if (!SOURCE_SUBDOMAIN || !TARGET_SUBDOMAIN) {
  throw new Error(
    'Environment variables SOURCE_SUBDOMAIN and TARGET_SUBDOMAIN must be set.',
  );
}

function extractDbName(url: string): string {
  const withoutQuery = url.split('?')[0];
  return withoutQuery.slice(withoutQuery.lastIndexOf('/') + 1);
}

const command = async () => {
  const coreUrl = CORE_MONGO_URL || MONGO_URL;
  const coreDbName = extractDbName(coreUrl);
  const client = new MongoClient(coreUrl);

  await client.connect();

  const coreDb = client.db(coreDbName);
  const orgsCollection = coreDb.collection('organizations');

  const sourceOrg = await orgsCollection.findOne(
    { subdomain: SOURCE_SUBDOMAIN },
    { projection: { _id: 1 } },
  );

  if (!sourceOrg) {
    throw new Error(
      `Organization "${SOURCE_SUBDOMAIN}" not found in ${coreDbName}.organizations`,
    );
  }

  const targetOrg = await orgsCollection.findOne(
    { subdomain: TARGET_SUBDOMAIN },
    { projection: { _id: 1 } },
  );

  if (!targetOrg) {
    throw new Error(
      `Organization "${TARGET_SUBDOMAIN}" not found in ${coreDbName}.organizations`,
    );
  }

  const sourceDbName = `erxes_${sourceOrg._id}`;
  const targetDbName = `erxes_${targetOrg._id}`;
  console.log(`Source: ${SOURCE_SUBDOMAIN} → ${sourceDbName}`);
  console.log(`Target: ${TARGET_SUBDOMAIN} → ${targetDbName}`);

  const srcCol = client.db(sourceDbName).collection('tags');
  const dstCol = client.db(targetDbName).collection('tags');

  try {
    const sourceCount = await srcCol.countDocuments();
    console.log(`Source tags: ${sourceCount}`);

    if (sourceCount === 0) {
      console.log('No tags to insert.');
      return;
    }

    // Build existing name set in target to avoid duplicates
    const existingNames = new Set<string>();
    const existingIds = new Set<string>();

    for await (const doc of dstCol.find({}, { projection: { _id: 1, name: 1 } })) {
      existingIds.add(String(doc._id));
      if (doc.name) existingNames.add(String(doc.name));
    }

    const toInsert: any[] = [];
    let skipped = 0;

    for await (const tag of srcCol.find({})) {
      if (existingIds.has(String(tag._id))) {
        skipped++;
        continue;
      }

      if (tag.name && existingNames.has(String(tag.name))) {
        console.log(`  [SKIP] name "${tag.name}" already exists in target`);
        skipped++;
        continue;
      }

      existingIds.add(String(tag._id));
      if (tag.name) existingNames.add(String(tag.name));
      toInsert.push(tag);
    }

    if (toInsert.length > 0) {
      const result = await dstCol.insertMany(toInsert, { ordered: false });
      console.log(`Inserted: ${result.insertedCount}, Skipped: ${skipped}`);
    } else {
      console.log(`Nothing to insert. Skipped: ${skipped}`);
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }

  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command();
