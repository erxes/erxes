import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let UsersCollection: Collection<any>;

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  UsersCollection = db.collection('users');

  const users = await UsersCollection.find({}).toArray();

  for (const user of users) {
    if (user.details && user.details.fullName) {
      const firstName = user.details.fullName.split(' ')[0];
      const lastName = user.details.fullName.split(' ')[1];

      await UsersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            'details.firstName': firstName,
            'details.lastName': lastName
          }
        }
      );
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
