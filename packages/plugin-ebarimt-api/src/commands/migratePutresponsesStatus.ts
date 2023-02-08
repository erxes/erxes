import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';
const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let PutResponses: Collection<any>;

const codes: string[] = [];

const command = async () => {
  console.log(`start.... ${MONGO_URL}`);

  await client.connect();

  console.log('connected...');
  db = client.db() as Db;

  PutResponses = db.collection('put_responses');

  try {
    const hasReturnBillIdResponses = await PutResponses.find({
      returnBillId: { $exists: true }
    }).toArray();
    await PutResponses.updateMany(
      {
        billId: { $in: hasReturnBillIdResponses.map(pr => pr.returnBillId) }
      },
      { $set: { status: 'inactive' } }
    );
  } catch (e) {
    console.log(`Error occurred: ${e.message}`);
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};
command();
