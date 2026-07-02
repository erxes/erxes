import * as dotenv from 'dotenv';

dotenv.config();

import { APPROVAL_NOTIFICATION_CONTENT_TYPE } from 'erxes-api-shared/core-modules';
import { Db, MongoClient } from 'mongodb';

const { MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true' } =
  process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const client = new MongoClient(MONGO_URL);

const command = async () => {
  await client.connect();

  const db: Db = client.db();
  const notifications = db.collection('notifications');

  try {
    const result = await notifications.updateMany(
      {
        contentType: APPROVAL_NOTIFICATION_CONTENT_TYPE,
        'metadata.targetLink': { $exists: true },
      },
      {
        $unset: { 'metadata.targetLink': '' },
      },
    );

    console.log(
      `Removed approval notification target links from ${result.modifiedCount} notification(s).`,
    );
  } finally {
    await client.close();
  }

  console.log(`Process finished at: ${new Date().toISOString()}`);
  process.exit();
};

command();
