import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let Emails: Collection<any>;

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  Emails = db.collection('emails');

const emails = await Emails.find({}).toArray();

for (const email of emails) {
 
    await Emails.updateOne({ _id: email._id }, { $set: { verifiedAt: email.created } });
  
}
  console.debug(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
