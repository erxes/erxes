const { MongoClient } = require('mongodb');

const MONGO_URL =
  process.argv[2] || 'mongodb://localhost:27017/erxes?directConnection=true';

if (!MONGO_URL) {
  throw new Error('MONGO_URL not provided');
}

const client = new MongoClient(MONGO_URL);

let db;

async function migrate() {
  await client.connect();
  db = client.db();

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
