const { MongoClient } = require('mongodb');
import * as dotenv from 'dotenv';
dotenv.config();

const MONGO_URL =
  process.env.MONGO_URL ||
  'mongodb://localhost:27017/erxes?directConnection=true';

const CORE_MONGO_URL = process.env.CORE_MONGO_URL;
const TARGET_SUBDOMAIN = process.env.TARGET_SUBDOMAIN;

console.log(MONGO_URL, 'MONGO_URL');

if (!MONGO_URL) {
  throw new Error('MONGO_URL not provided');
}

if (!TARGET_SUBDOMAIN) {
  throw new Error('Environment variable TARGET_SUBDOMAIN must be set.');
}

function extractDbName(url) {
  const withoutQuery = url.split('?')[0];
  return withoutQuery.slice(withoutQuery.lastIndexOf('/') + 1);
}

const client = new MongoClient(CORE_MONGO_URL || MONGO_URL);

let db;

async function migrate() {
  await client.connect();

  const coreUrl = CORE_MONGO_URL || MONGO_URL;
  const coreDbName = extractDbName(coreUrl);
  const coreDb = client.db(coreDbName);

  const targetOrg = await coreDb
    .collection('organizations')
    .findOne({ subdomain: TARGET_SUBDOMAIN }, { projection: { _id: 1 } });

  if (!targetOrg) {
    throw new Error(
      `Organization with subdomain "${TARGET_SUBDOMAIN}" not found in ${coreDbName}.organizations`,
    );
  }

  const targetDbName = `erxes_${targetOrg._id}`;
  console.log(`Target: ${TARGET_SUBDOMAIN} → ${targetDbName}`);

  db = client.db(targetDbName);

  const Channel = db.collection('channels');
  const ChannelMembers = db.collection('channel_members');
  const Integrations = db.collection('integrations');

  const channels = await Channel.find({}).toArray();

  for (const channel of channels) {
    const channelId = channel._id.toString();

    if (channel.memberIds && channel.memberIds.length > 0) {
      for (const memberId of channel.memberIds) {
        const exists = await ChannelMembers.findOne({ channelId, memberId });
        if (!exists) {
          await ChannelMembers.insertOne({
            channelId,
            memberId,
            role: memberId === channel.createdBy ? 'admin' : 'member',
            createdAt: new Date(),
          });
        }
      }
    }

    if (channel.integrationIds && channel.integrationIds.length > 0) {
      // Convert string IDs to ObjectIds

      for (const id of channel.integrationIds) {
        if (!id) continue;
        console.log(id, 'id...');
        try {
          const result = await Integrations.updateOne(
            { _id: id },
            { $set: { channelId: channelId } },
          );

          console.log(`found ${result} integrations for channel ${channelId}`);
        } catch (error) {
          console.log(`error ${error.message}`);
        }
      }
    }
  }

  console.log('Migration done ✅');
  process.exit(0);
}

// ---- Run ----
migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
